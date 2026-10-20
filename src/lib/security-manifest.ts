export const SECURITY_MANIFEST = {
  "scannedAt": "2026-10-20T21:50:29.931Z",
  "scanner": "house-scan",
  "status": "clean",
  "filesChecked": 106,
  "findings": [],
  "checks": [
    "no-eval",
    "no-miner-strings",
    "no-hidden-payload",
    "sha256-manifest"
  ],
  "sha256": {
    "package.json": "3ad30a8f7e2c5dc7731b86f6b1fb86cf86a79c90782794455feae41766a04fcc",
    "vercel.json": "a47ba777b223ce1015803e0817dcf813931902096da4b890952e8b5ba27c19f3",
    "src/lib/now-pack.ts": "e0b8b603fddc326fbc2371055e76c8366170d7a51be2614b9c5b0f8e434484c6",
    "src/lib/roasts.ts": "cf3b17eebc40ca554894238824098717a0cfb7c4a85ecde24a38d571c1f5711c",
    "src/routes/contributors.tsx": "c006191349e45519af6fb38ff1cee8d4b38a53c527d4d2549e88e9ffbc1eb0c4",
    "server/middleware/security.ts": "e7852c96c3bd3fba8b8ee0e8f3fd42a557ef5f609a79a1f8d708e1b671bbb19d",
    "scripts/security-headers.mjs": "8b5a5830c6693d09584b47820aa7bbe3a11a4d99abbdaedfd1835694a93ae14f"
  }
} as const;
