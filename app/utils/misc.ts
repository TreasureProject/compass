import type { HeadersFunction } from "@remix-run/node";
import { cacheHeader } from "pretty-cache-header";

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");
  if (!host) {
    throw new Error("Could not determine domain URL.");
  }
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export const commonHeaders: HeadersFunction = ({ loaderHeaders }) => {
  const preview = loaderHeaders.get("preview");
  return {
    "Cache-Control": preview
      ? cacheHeader({
          public: true,
          noCache: true,
        })
      : cacheHeader({
          public: true,
          maxAge: "1hour",
          staleWhileRevalidate: "1min",
        }),
  };
};
