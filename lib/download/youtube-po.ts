import { BotGuardClient } from "bgutils-js/botguard";
import type { WebPoSignalOutput } from "bgutils-js/shared-types";
import { buildURL, getHeaders } from "bgutils-js/utils";
import { WebPoMinter } from "bgutils-js/webpo";
import { JSDOM } from "jsdom";
import { Innertube, UniversalCache } from "youtubei.js";
import { ensureYouTubeEvaluator } from "@/lib/download/youtube-platform";

ensureYouTubeEvaluator();

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";

type PoContext = {
  innertube: Innertube;
  minter: WebPoMinter;
  visitorData: string;
  expiresAt: number;
};

let poContextPromise: Promise<PoContext> | null = null;

function setupDomEnvironment() {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "https://www.youtube.com/",
    referrer: "https://www.youtube.com/",
  });

  const view = dom.window;

  Object.assign(globalThis, {
    window: view,
    document: view.document,
    location: view.location,
    origin: view.origin,
  });

  if (!Reflect.has(globalThis, "navigator")) {
    Object.defineProperty(globalThis, "navigator", {
      value: view.navigator,
      configurable: true,
    });
  }
}

async function createPoContext(): Promise<PoContext> {
  setupDomEnvironment();

  const bootstrap = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  const challengeResponse = await bootstrap.getAttestationChallenge(
    "ENGAGEMENT_TYPE_UNBOUND"
  );

  if (!challengeResponse.bg_challenge) {
    throw new Error("Could not get BotGuard challenge");
  }

  const interpreterUrl =
    challengeResponse.bg_challenge.interpreter_url
      .private_do_not_access_or_else_trusted_resource_url_wrapped_value;
  const bgScriptResponse = await fetch(`https:${interpreterUrl}`);
  const interpreterJavascript = await bgScriptResponse.text();

  if (!interpreterJavascript) {
    throw new Error("Could not load BotGuard VM");
  }

  new Function(interpreterJavascript)();

  const botGuardClient = await BotGuardClient.create({
    program: challengeResponse.bg_challenge.program,
    globalName: challengeResponse.bg_challenge.global_name,
    globalObject: globalThis,
  });

  const webPoSignalOutput: WebPoSignalOutput = [];
  const botguardResponse = await botGuardClient.snapshot({ webPoSignalOutput });

  const integrityTokenResponse = await fetch(buildURL("GenerateIT", false), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify([REQUEST_KEY, botguardResponse]),
  });

  if (!integrityTokenResponse.ok) {
    throw new Error(`Failed to fetch integrity token (${integrityTokenResponse.status})`);
  }

  const integrityTokenJson = (await integrityTokenResponse.json()) as [
    string,
    number,
    number,
    string,
  ];

  const minter = await WebPoMinter.create(
    {
      integrityToken: integrityTokenJson[0],
      estimatedTtlSecs: integrityTokenJson[1],
      mintRefreshThreshold: integrityTokenJson[2],
      websafeFallbackToken: integrityTokenJson[3],
    },
    webPoSignalOutput
  );

  const visitorData = bootstrap.session.context.client.visitorData;
  if (!visitorData) {
    throw new Error("Missing visitor data for PO token");
  }

  const sessionPoToken = await minter.mintAsWebsafeString(visitorData);

  const innertube = await Innertube.create({
    cache: new UniversalCache(false),
    visitor_data: visitorData,
    po_token: sessionPoToken,
    generate_session_locally: false,
  });

  return {
    innertube,
    minter,
    visitorData,
    expiresAt: Date.now() + integrityTokenJson[1] * 1000,
  };
}

export async function getPoContext(): Promise<PoContext> {
  if (poContextPromise) {
    const current = await poContextPromise;
    if (Date.now() < current.expiresAt - 60_000) {
      return current;
    }
    poContextPromise = null;
  }

  poContextPromise = createPoContext();

  try {
    return await poContextPromise;
  } catch (error) {
    poContextPromise = null;
    throw error;
  }
}

export async function getContentPoToken(videoId: string): Promise<string> {
  const { minter } = await getPoContext();
  return minter.mintAsWebsafeString(videoId);
}
