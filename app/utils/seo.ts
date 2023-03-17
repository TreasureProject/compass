export function getSocialMetas({
  url,
  title = generateTitle(),
  description = "The magic of play. Get the latest news and updates from Treasure, the decentralized gaming ecosystem.",
  keywords = "",
}: {
  image?: string;
  url: string;
  title?: string;
  description?: string;
  keywords?: string;
}) {
  return {
    title,
    description,
    keywords,
    // image,
    "og:url": url,
    "og:title": title,
    "og:description": description,
    // "og:image": image,
    // "twitter:card": image ? "summary_large_image" : "summary",
    "twitter:creator": "@Treasure_DAO",
    "twitter:site": "@Treasure_DAO",
    "twitter:title": title,
    "twitter:description": description,
    // "twitter:image": image,
    "twitter:alt": title,
  };
}

function removeTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function getUrl(requestInfo?: { origin: string; path: string }) {
  return removeTrailingSlash(
    `${requestInfo?.origin ?? "https://compass.treasure.lol"}${
      requestInfo?.path ?? ""
    }`
  );
}

export function generateTitle(title?: string) {
  return title
    ? `${title} | The Compass by Treasure`
    : "The Compass by Treasure";
}
