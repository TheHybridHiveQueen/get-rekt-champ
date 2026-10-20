import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

import { IDEA_CREDIT, SEARCH_DESCRIPTION } from "@/lib/credit";

const APP_NAME = "Get Rekt Champ";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  applicationCategory: "EntertainmentApplication",
  operatingSystem: "Web",
  description: SEARCH_DESCRIPTION,
  isAccessibleForFree: true,
  inLanguage: "en",
  keywords: "parody, satire, memes, public figures, handmade GIF, Get Rekt Champ",
  author: {
    "@type": "Person",
    name: "TheHybridHiveQueen",
    url: "https://github.com/TheHybridHiveQueen",
  },
  creator: {
    "@type": "Person",
    name: "TheHybridHiveQueen",
  },
  creditText: IDEA_CREDIT,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${APP_NAME} — T-rated parody pit` },
      { name: "description", content: SEARCH_DESCRIPTION },
      {
        name: "keywords",
        content:
          "Get Rekt Champ, parody, satire, memes, public figures, handmade GIF, TheHybridHiveQueen",
      },
      { name: "author", content: "TheHybridHiveQueen" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "rating", content: "general" },
      { name: "theme-color", content: "#14110e" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "author", href: "https://github.com/TheHybridHiveQueen" },
      { rel: "author", href: "/humans.txt" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Literata:ital,opsz,wght@0,7..72,500;0,7..72,700;1,7..72,500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
