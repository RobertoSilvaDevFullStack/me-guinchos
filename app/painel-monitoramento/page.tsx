import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PainelMonitoramentoClient } from "@/components/painel-monitoramento/PainelMonitoramentoClient";
import {
  createSignedBridgeHeaders,
  resolveBridgeSecret,
  resolveSafeUpstreamOrigin,
} from "@/lib/ponte-api-seguranca";

export const dynamic = "force-dynamic";

const SESSION_COOKIE_NAME = "meg_admin_session";
const WELL_FORMED_TOKEN_REGEX = /^[A-Za-z0-9_-]{32,256}$/;

async function verifySessionOnServer(
  token: string,
  forwardedFor: string | null,
  realIp: string | null,
): Promise<boolean> {
  try {
    const upstreamOrigin = resolveSafeUpstreamOrigin(
      process.env.MONITORING_API_INTERNAL_URL,
    );
    const bridgeSecret = resolveBridgeSecret(
      process.env.MONITORING_BRIDGE_SECRET,
      process.env.NODE_ENV,
      process.env.SITE_PREVIEW_BUILD === "1",
    );
    const pathWithQuery = "/api/v1/admin/session";
    const reqHeaders = new Headers({
      Cookie: `${SESSION_COOKIE_NAME}=${token}`,
      Accept: "application/json",
    });
    if (forwardedFor) reqHeaders.set("x-forwarded-for", forwardedFor);
    if (realIp) reqHeaders.set("x-real-ip", realIp);

    if (bridgeSecret) {
      const signed = createSignedBridgeHeaders({
        secret: bridgeSecret,
        method: "GET",
        pathWithQuery,
        forwardedFor,
        realIp,
        rawBody: null,
      });
      for (const [k, v] of Object.entries(signed)) {
        reqHeaders.set(k, v);
      }
    }

    const res = await fetch(`${upstreamOrigin}${pathWithQuery}`, {
      method: "GET",
      headers: reqHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { authenticated?: boolean };
    return body?.authenticated === true;
  } catch {
    return false;
  }
}

export default async function PaginaPainelMonitoramento() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim();

  if (!sessionToken || !WELL_FORMED_TOKEN_REGEX.test(sessionToken)) {
    redirect("/painel-monitoramento/login");
  }

  const reqHeaders = await headers();
  const isValidSession = await verifySessionOnServer(
    sessionToken,
    reqHeaders.get("x-forwarded-for"),
    reqHeaders.get("x-real-ip"),
  );
  if (!isValidSession) {
    redirect("/painel-monitoramento/login");
  }

  return <PainelMonitoramentoClient />;
}
