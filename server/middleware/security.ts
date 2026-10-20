import { securityHeaderMap } from "../../scripts/security-headers.mjs";

interface SecurityEvent {
  url: URL;
  req: { headers: Headers };
}

function isLocalHost(host: string) {
  const name = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    name === "localhost" ||
    name === "127.0.0.1" ||
    name === "[::1]" ||
    name.endsWith(".grok-sandbox.com") ||
    name === "grok-sandbox.com"
  );
}

export default async function securityMiddleware(
  event: SecurityEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const result = await next();
  if (!(result instanceof Response)) return result;
  const headers = new Headers(result.headers);
  const dev = isLocalHost(event.req.headers.get("host") ?? event.url.host);
  for (const [name, value] of Object.entries(securityHeaderMap(dev))) {
    if (!headers.has(name)) headers.set(name, value);
  }
  const host = (event.req.headers.get("x-forwarded-host") ?? event.req.headers.get("host") ?? "").split(",")[0] ?? "";
  const https = (event.req.headers.get("x-forwarded-proto") ?? event.url.protocol.replace(":", "")) === "https";
  if (https && !isLocalHost(host) && !headers.has("strict-transport-security")) {
    headers.set("strict-transport-security", "max-age=15552000");
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
