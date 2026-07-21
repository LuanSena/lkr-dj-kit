"use client";

import { BotGuardClient, getChallenge } from "bgutils-js/botguard";
import type { WebPoSignalOutput } from "bgutils-js/shared-types";
import { buildURL, getHeaders } from "bgutils-js/utils";
import { WebPoMinter } from "bgutils-js/webpo";
import type { Innertube } from "youtubei.js";
import { ensureYouTubeEvaluator } from "@/lib/download/youtube-platform";

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";

export type BrowserPoContext = {
  innertube: Innertube;
  minter: WebPoMinter;
  visitorData: string;
  sessionPoToken: string;
  expiresAt: number;
};

let contextPromise: Promise<BrowserPoContext> | null = null;

async function createBrowserPoContext(): Promise<BrowserPoContext> {
  ensureYouTubeEvaluator();

  const { Innertube, UniversalCache } = await import("youtubei.js");
  const bootstrap = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
  });

  const visitorData = bootstrap.session.context.client.visitorData;
  if (!visitorData) {
    throw new Error("Missing visitor data");
  }

  const challenge = await getChallenge({
    fetchFunction: fetch,
    requestKey: REQUEST_KEY,
  });

  const interpreterJavascript =
    challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (!interpreterJavascript || !challenge.program || !challenge.globalName) {
    throw new Error("BotGuard challenge unavailable");
  }

  new Function(interpreterJavascript)();

  const botGuardClient = await BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
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
    throw new Error(`Integrity token failed (${integrityTokenResponse.status})`);
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
    sessionPoToken,
    expiresAt: Date.now() + integrityTokenJson[1] * 1000,
  };
}

export async function getBrowserPoContext(): Promise<BrowserPoContext> {
  if (contextPromise) {
    const current = await contextPromise;
    if (Date.now() < current.expiresAt - 60_000) {
      return current;
    }
    contextPromise = null;
  }

  contextPromise = createBrowserPoContext();

  try {
    return await contextPromise;
  } catch (error) {
    contextPromise = null;
    throw error;
  }
}

export async function getBrowserContentPoToken(videoId: string): Promise<string> {
  const { minter } = await getBrowserPoContext();
  return minter.mintAsWebsafeString(videoId);
}
