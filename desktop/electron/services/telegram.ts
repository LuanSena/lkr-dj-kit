import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import type { NewMessageEvent } from "telegram/events";
import { computeCheck } from "telegram/Password";

const CREDS_FILE = "telegram.json";
export const BEATPORT_BOT = "beatport_downloader_bot";

type StoredCreds = {
  apiId: number;
  apiHash: string;
  session: string;
  username?: string;
  phone?: string;
  firstName?: string;
};

export type TelegramStatus = {
  connected: boolean;
  username?: string;
  phone?: string;
  firstName?: string;
};

function credsPath() {
  return path.join(app.getPath("userData"), CREDS_FILE);
}

function readCreds(): StoredCreds | null {
  try {
    const p = credsPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8")) as StoredCreds;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeCreds(creds: StoredCreds) {
  fs.writeFileSync(credsPath(), JSON.stringify(creds, null, 2), "utf8");
}

function clearCreds() {
  try {
    fs.rmSync(credsPath(), { force: true });
  } catch {
    // ignore
  }
}

// ---- Login state machine -------------------------------------------------

type PendingLogin = {
  client: TelegramClient;
  apiId: number;
  apiHash: string;
  phone: string;
  phoneCodeHash: string;
};

let pendingLogin: PendingLogin | null = null;
let cachedClient: TelegramClient | null = null;

function newClient(apiId: number, apiHash: string, session = "") {
  const client = new TelegramClient(new StringSession(session), apiId, apiHash, {
    connectionRetries: 3,
    useWSS: false,
  });
  // Keep GramJS quiet.
  try {
    client.setLogLevel("error" as never);
  } catch {
    // ignore
  }
  return client;
}

export async function telegramStartLogin(input: {
  apiId: number;
  apiHash: string;
  phone: string;
}): Promise<{ needsCode: true }> {
  // Reset any previous attempt.
  if (pendingLogin) {
    try {
      await pendingLogin.client.disconnect();
    } catch {
      // ignore
    }
    pendingLogin = null;
  }

  const client = newClient(input.apiId, input.apiHash);
  await client.connect();

  const { phoneCodeHash } = await client.sendCode(
    { apiId: input.apiId, apiHash: input.apiHash },
    input.phone
  );

  pendingLogin = {
    client,
    apiId: input.apiId,
    apiHash: input.apiHash,
    phone: input.phone,
    phoneCodeHash,
  };

  return { needsCode: true };
}

async function finalizeLogin(client: TelegramClient, apiId: number, apiHash: string) {
  const me = (await client.getMe()) as Api.User;
  const creds: StoredCreds = {
    apiId,
    apiHash,
    session: client.session.save() as unknown as string,
    username: me.username ?? undefined,
    phone: me.phone ?? undefined,
    firstName: me.firstName ?? undefined,
  };
  writeCreds(creds);
  cachedClient = client;
  pendingLogin = null;
  return {
    connected: true as const,
    username: creds.username,
    phone: creds.phone,
    firstName: creds.firstName,
  };
}

export async function telegramSubmitCode(input: {
  code: string;
}): Promise<{ connected: true } & TelegramStatus | { needsPassword: true }> {
  if (!pendingLogin) {
    throw new Error("Nenhum login em andamento. Recomece a conexão.");
  }
  const { client, apiId, apiHash, phone, phoneCodeHash } = pendingLogin;

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash,
        phoneCode: input.code,
      })
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("SESSION_PASSWORD_NEEDED")) {
      return { needsPassword: true };
    }
    if (msg.includes("PHONE_CODE_INVALID") || msg.includes("PHONE_CODE_EMPTY")) {
      throw new Error("Código inválido. Confira e tente de novo.");
    }
    if (msg.includes("PHONE_CODE_EXPIRED")) {
      throw new Error("O código expirou. Recomece a conexão.");
    }
    throw new Error(msg);
  }

  return { ...(await finalizeLogin(client, apiId, apiHash)) };
}

export async function telegramSubmitPassword(input: {
  password: string;
}): Promise<{ connected: true } & TelegramStatus> {
  if (!pendingLogin) {
    throw new Error("Nenhum login em andamento. Recomece a conexão.");
  }
  const { client, apiId, apiHash } = pendingLogin;

  try {
    const passwordInfo = await client.invoke(new Api.account.GetPassword());
    const check = await computeCheck(passwordInfo, input.password);
    await client.invoke(new Api.auth.CheckPassword({ password: check }));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("PASSWORD_HASH_INVALID")) {
      throw new Error("Senha incorreta. Tente novamente.");
    }
    throw new Error(msg);
  }

  return finalizeLogin(client, apiId, apiHash);
}

export async function telegramLogout(): Promise<{ connected: false }> {
  const client = cachedClient;
  cachedClient = null;
  if (client) {
    try {
      await client.invoke(new Api.auth.LogOut());
    } catch {
      // ignore
    }
    try {
      await client.disconnect();
    } catch {
      // ignore
    }
  }
  clearCreds();
  return { connected: false };
}

export function telegramStatus(): TelegramStatus {
  const creds = readCreds();
  if (creds?.session) {
    return {
      connected: true,
      username: creds.username,
      phone: creds.phone,
      firstName: creds.firstName,
    };
  }
  return { connected: false };
}

async function getConnectedClient(): Promise<TelegramClient> {
  if (cachedClient && cachedClient.connected) {
    return cachedClient;
  }
  const creds = readCreds();
  if (!creds?.session) {
    throw new Error("Telegram não conectado.");
  }
  const client = newClient(creds.apiId, creds.apiHash, creds.session);
  await client.connect();
  cachedClient = client;
  return client;
}

// ---- Beatport via bot -----------------------------------------------------

type ProgressCallback = (payload: { progress: number; status: string }) => void;

/**
 * Sends the given URL to the Beatport bot as the logged-in user and waits for
 * the bot to reply with an audio file. Downloads it to a temp path and returns
 * the local file path + best-effort title.
 */
export async function downloadViaBeatportBot(
  url: string,
  tempDir: string,
  onProgress: ProgressCallback
): Promise<{ tempPath: string; title: string }> {
  const client = await getConnectedClient();

  let bot: Api.TypeInputPeer;
  try {
    bot = await client.getInputEntity(BEATPORT_BOT);
  } catch {
    throw new Error(
      "Não consegui acessar o bot. Abra o @beatport_downloader_bot no Telegram e toque em Iniciar uma vez."
    );
  }

  fs.mkdirSync(tempDir, { recursive: true });
  onProgress({ progress: 8, status: "preparing" });

  // Record the current top message id so we only react to *newer* replies.
  let sinceId = 0;
  try {
    const recent = await client.getMessages(bot, { limit: 1 });
    sinceId = recent?.[0]?.id ?? 0;
  } catch {
    sinceId = 0;
  }

  await client.sendMessage(bot, { message: url });
  onProgress({ progress: 18, status: "downloading" });

  const message = await waitForBotFile(client, bot, sinceId, 180_000, onProgress);

  onProgress({ progress: 75, status: "converting" });

  const fileName = (message as unknown as { file?: { name?: string } }).file?.name;
  const originalName = fileName || `${message.id}.audio`;
  const safeName = originalName.replace(/[/\\]/g, "_");
  const tempPath = path.join(tempDir, `beatport-${message.id}-${safeName}`);

  await client.downloadMedia(message, { outputFile: tempPath });

  if (!fs.existsSync(tempPath)) {
    throw new Error("Falha ao baixar o arquivo do Telegram.");
  }

  const title = path.basename(safeName, path.extname(safeName)) || "Beatport track";
  return { tempPath, title };
}

function waitForBotFile(
  client: TelegramClient,
  bot: Api.TypeInputPeer,
  sinceId: number,
  timeoutMs: number,
  onProgress: ProgressCallback
): Promise<Api.Message> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const handler = async (event: NewMessageEvent) => {
      const msg = event.message;
      if (msg.id <= sinceId) return;
      const m = msg as unknown as {
        media?: unknown;
        document?: unknown;
        audio?: unknown;
        voice?: unknown;
        message?: string;
      };
      // Only accept messages that carry a downloadable audio/document.
      if (m.media && (m.document || m.audio || m.voice)) {
        finish(null, msg);
      } else if (m.message) {
        // status text from the bot — keep waiting, nudge progress
        onProgress({ progress: 30, status: "downloading" });
      }
    };

    const event = new NewMessage({ fromUsers: [bot as never] });
    client.addEventHandler(handler, event);

    const timer = setTimeout(() => {
      finish(
        new Error(
          "O bot não respondeu com o arquivo a tempo. Verifique o link do Beatport e tente novamente."
        ),
        null
      );
    }, timeoutMs);

    function finish(err: Error | null, msg: Api.Message | null) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        client.removeEventHandler(handler, event);
      } catch {
        // ignore
      }
      if (err) reject(err);
      else resolve(msg as Api.Message);
    }
  });
}
