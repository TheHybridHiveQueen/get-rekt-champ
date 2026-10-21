const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);

function blockedHost(host: string): boolean {
  const name = host.toLowerCase().replace(/\.$/, "");
  if (!name || BLOCKED_HOSTS.has(name)) return true;
  if (name.endsWith(".local") || name.endsWith(".internal") || name.endsWith(".localhost")) return true;
  if (!name.includes(".")) return true;
  if (name.includes(":") || name.startsWith("[") || /^\d{1,3}(\.\d{1,3}){3}$/.test(name)) return true;
  const parts = name.split(".").map((part) => Number(part));
  if (parts.length === 4 && parts.every((part) => part >= 0 && part <= 255)) {
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function giphyFileHost(host: string): boolean {
  const name = host.toLowerCase().replace(/\.$/, "");
  if (name === "giphy.com" || name === "www.giphy.com") return false;
  return name === "media.giphy.com" || name === "i.giphy.com" || name.endsWith(".giphy.com");
}

/** Null when the link is empty or a direct public Giphy GIF. A string is the reason to refuse it. */
export function gifProblem(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 300) return "That GIF link is too long.";
  if (/[\s<>"']/.test(trimmed)) return "That GIF link has characters a link should not.";
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return "Paste a direct https Giphy link ending in .gif.";
  }
  if (url.protocol !== "https:") return "Use https. No other kind of link.";
  if (url.username || url.password) return "Drop the username and password from the link.";
  if (blockedHost(url.hostname)) return "That host is not a public GIF.";
  if (!giphyFileHost(url.hostname)) return "Only a direct Giphy GIF link is allowed.";
  let path = url.pathname;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    return "That GIF link is not readable.";
  }
  const lower = path.toLowerCase();
  if (lower.includes("..") || lower.includes("\\") || !lower.endsWith(".gif")) {
    return "The link has to be a file that ends in .gif.";
  }
  if (/\.(html|svg|js|mjs|php|exe|zip)(\?|$)/i.test(lower)) return "That file is not a GIF.";
  return null;
}

/** Best-effort check. A clear non-GIF is refused. A host we cannot reach is left for the browser. */
export async function confirmPublicGif(value: string): Promise<string | null> {
  const problem = gifProblem(value);
  if (problem || !value.trim()) return problem;
  const url = new URL(value.trim());
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: ctrl.signal,
      headers: { range: "bytes=0-32" },
    });
    await res.body?.cancel();
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return "That GIF redirects somewhere we will not follow.";
      const hop = gifProblem(new URL(next, url).toString());
      if (hop) return "That GIF redirects somewhere we will not follow.";
      return null;
    }
    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    if (type.includes("text/html") || type.includes("javascript") || type.includes("svg")) {
      return "That link opened as a page, not a GIF.";
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
