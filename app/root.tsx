import { useMemo, useEffect } from "react";
import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
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

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressStyles },
];

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Web3 Frontend Starter Template",
  viewport: "width=device-width,initial-scale=1",
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

export const loader = async ({ request }: LoaderArgs) => {
  const themeSession = await getThemeSession(request);
  const requestUrl = new URL(request.url);

  const preview =
    requestUrl?.searchParams?.get("preview") === process.env.PREVIEW_SECRET;

  const posts = await contenfulDeliverySdk(preview).getAllBlogPosts({
    preview,
  });

  return json({
    ENV: getPublicKeys(process.env),
    theme: themeSession.getTheme(),
    preview,
    posts,
  });
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
            <div className="container flex flex-1 items-center justify-center space-x-2">
              <h1 className="text-4xl font-bold">Oops!</h1>
              <p className="text-xl">{caught.data.message}</p>
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
