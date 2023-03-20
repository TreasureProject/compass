import { useMemo, useEffect } from "react";
import type {
  HeadersFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useNavigation,
  useFetchers,
  useLoaderData,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";
import { Toaster } from "sonner";

import NProgress from "nprogress";

import styles from "./styles/tailwind.css";
import nProgressStyles from "./styles/nprogress.css";

import type { Env } from "./types";
import { Layout } from "./components/Layout";
import { getThemeSession } from "./utils/theme.server";
import {
  ThemeBody,
  ThemeHead,
  ThemeProvider,
  useTheme,
} from "./utils/theme-provider";
import { contenfulDeliverySdk } from "./utils/client";
import { formatDate } from "./utils/lib";
import { getDomainUrl } from "./utils/misc";
import { cacheHeader } from "pretty-cache-header";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressStyles },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
  {
    rel: "mask-icon",
    href: "/safari-pinned-tab.svg",
    color: "#c62222",
  },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Web3 Frontend Starter Template",
  viewport: "width=device-width,initial-scale=1",
  "msapplication-TileColor": "#fffaef",
  "theme-color": "#fffaef",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const strictEntries = <T extends Record<string, any>>(
  object: T
): [keyof T, T[keyof T]][] => {
  return Object.entries(object);
};

function getPublicKeys(env: Env): Env {
  const publicKeys = {} as Env;
  for (const [key, value] of strictEntries(env)) {
    if (key.startsWith("PUBLIC_")) {
      publicKeys[key] = value;
    }
  }
  return publicKeys;
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers();

  if (loaderHeaders.has("Cache-Control")) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headers.set("Cache-Control", loaderHeaders.get("Cache-Control")!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headers.set("CDN-Cache-Control", loaderHeaders.get("Cache-Control")!);
  }
  return headers;
};

export const loader = async ({ request }: LoaderArgs) => {
  const themeSession = await getThemeSession(request);
  const requestUrl = new URL(request.url);

  const preview =
    requestUrl?.searchParams?.get("preview") === process.env.PREVIEW_SECRET;

  const data = await contenfulDeliverySdk(preview).getAllBlogPosts({
    preview,
  });

  const posts = data.blogPostCollection?.items ?? [];

  const headers = {
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

  return json(
    {
      requestInfo: {
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
      },
      ENV: getPublicKeys(process.env),
      theme: themeSession.getTheme(),
      preview,
      posts: posts.map((post) => ({
        ...post,
        date: formatDate(post?.date),
      })),
    },
    { status: 200, headers }
  );
};

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  const transition = useNavigation();

  const fetchers = useFetchers();

  const state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      const states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers]
  );

  // slim loading bars on top of the page, for page transitions
  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state, transition.state]);

  return (
    <html lang="en" className={`h-full scroll-smooth ${theme ?? ""}`}>
      <head>
        <Meta />
        <Links />
        <ThemeHead ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="h-full bg-honey-50 antialiased dark:bg-night-900">
        <Outlet />
        <ThemeBody ssrTheme={Boolean(data.theme)} />

        <Toaster richColors />

        <Scripts />
        <ScrollRestoration />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  const theme = caught.data.theme;

  return (
    <ThemeProvider specifiedTheme={theme}>
      <html lang="en" className={`h-full ${theme ?? ""}`}>
        <head>
          <title>Oops!</title>
          <Meta />
          <Links />
          <ThemeHead ssrTheme={Boolean(theme)} />
        </head>
        <body className="h-full bg-honey-50 antialiased dark:bg-night-900">
          <ThemeBody ssrTheme={Boolean(theme)} />
          <Layout>
            <div className="container flex flex-1 flex-col items-center justify-center space-y-2 space-x-2">
              <h1 className="text-4xl font-bold text-night-900 dark:text-honey-25">
                Oops!
              </h1>
              <p className="text-lg text-night-600 dark:text-honey-500">
                {caught.data.message}
              </p>
            </div>
          </Layout>
        </body>
      </html>
    </ThemeProvider>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}
