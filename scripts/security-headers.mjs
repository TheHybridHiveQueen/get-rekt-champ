/** Shared response wrap for the dev server, Nitro, and Vercel. */

export const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "camera=()",
  "geolocation=()",
  "gyroscope=()",
  "microphone=()",
  "payment=()",
  "usb=()",
].join(", ");

const PROD_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://media.giphy.com https://i.giphy.com https://*.giphy.com",
  "connect-src 'self' https://media.giphy.com https://*.giphy.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "form-action 'self'",
].join("; ");

const DEV_CSP = [
  "default-src 'self' data: blob:",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://media.giphy.com https://i.giphy.com https://*.giphy.com",
  "connect-src 'self' ws: wss: https://media.giphy.com https://*.giphy.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "form-action 'self'",
].join("; ");

export function securityHeaderMap(dev = false) {
  return {
    "content-security-policy": dev ? DEV_CSP : PROD_CSP,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": PERMISSIONS_POLICY,
    "x-dns-prefetch-control": "off",
    "cross-origin-opener-policy": "same-origin-allow-popups",
  };
}

/** @param {import("node:http").ServerResponse} res */
export function applyNodeSecurityHeaders(res, dev = false) {
  const headers = securityHeaderMap(dev);
  for (const [name, value] of Object.entries(headers)) {
    if (typeof res.getHeader === "function" && res.getHeader(name)) continue;
    res.setHeader(name, value);
  }
}
