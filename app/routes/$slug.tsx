import type {
  LoaderArgs,
  MetaFunction,
  LinksFunction,
  HeadersFunction,
} from "@remix-run/node";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { contenfulDeliverySdk } from "~/utils/client";
import invariant from "tiny-invariant";
import { Layout } from "~/components/Layout";
import {
  Link,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { notFound, useHydrated } from "remix-utils";
import { parseDocument } from "~/utils/parse";
import React from "react";
import {
  cn,
  decimalToTime,
  formatDate,
  getAuthors,
  getSrcSet,
  slugify,
  toWebp,
} from "~/utils/lib";
import { getThemeSession } from "~/utils/theme.server";
import Balancer from "react-wrap-balancer";
import { generateTitle, getSocialMetas, getUrl } from "~/utils/seo";
import type { loader as rootLoader } from "~/root";
import highlightStyles from "highlight.js/styles/agate.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: highlightStyles },
];

export const headers: HeadersFunction = ({ parentHeaders }) => {
  const headers = new Headers();

  if (parentHeaders.has("Cache-Control")) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headers.set("Cache-Control", parentHeaders.get("Cache-Control")!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headers.set("CDN-Cache-Control", parentHeaders.get("Cache-Control")!);
  }
  return headers;
};

export const meta: MetaFunction = (args) => {
  const { requestInfo } = args.parentsData.root as SerializeFrom<
    typeof rootLoader
  >;
  const data = args.data as SerializeFrom<typeof loader>;

  return getSocialMetas({
    url: getUrl(requestInfo),
    title: generateTitle(data?.post.title || ""),
    description: data?.post.subtitle || "",
    image: data.ogImageUrl,
    keywords: data?.post.keywords || "",
  });
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const requestUrl = new URL(request.url);
  const themeSession = await getThemeSession(request);

  const preview =
    requestUrl?.searchParams?.get("preview") === process.env.PREVIEW_SECRET;

  const { slug } = params;

  invariant(slug, "Slug is required");

  const res = await contenfulDeliverySdk(preview).getBlogPost({
    slug,
    preview,
  });

  const post = res.blogPostCollection?.items[0];

  if (!post) {
    throw notFound({
      message: `Post with slug ${slug} not found`,
      theme: themeSession.getTheme(),
    });
  }

  const additionalBlogPosts = await contenfulDeliverySdk(
    preview
  ).additionalBlogPosts({
    categories: post.category as string[],
    preview,
  });

  // get random 3 posts from additionalBlogPosts
  const randomPosts =
    additionalBlogPosts.blogPostCollection?.items
      .sort(() => Math.random() - 0.5)
      .slice(0, 3) ?? [];

  const textToString = parseDocument(post);

  const ogImageUrl =
    `${requestUrl.origin}/resource/og?slug=${slug}` +
    (preview ? `&preview=${process.env.PREVIEW_SECRET}` : "");

  return json({
    post: {
      ...post,
      text: textToString,
      date: formatDate(post.date),
    },
    ogImageUrl,
    // get random 3 posts
    additionalBlogPosts: randomPosts.map((post) => ({
      ...post,
      date: formatDate(post?.date),
    })),
  });
};

export default function BlogPost() {
  const { post, additionalBlogPosts } = useLoaderData<typeof loader>();
  const [ids, setIds] = React.useState<{ id: string; name: string }[]>([]);
  const isHydrated = useHydrated();
  const currentHash = isHydrated ? location.hash.replace("#", "") : "";
  const params = useParams();
  const [searchParams] = useSearchParams();

  const authors = getAuthors(post);

  React.useEffect(() => {
    if (!currentHash) return;

    // scroll to the current hash
    const element = document.getElementById(currentHash);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [currentHash]);

  React.useEffect(() => {
    const container = document.getElementById("content");

    const h2s = Array.from(container ? container.querySelectorAll("h2") : []);

    const h3s = Array.from(container ? container.querySelectorAll("h3") : []);

    const headers = [...h2s, ...h3s];

    const anchors = Array.from(
      container ? container.querySelectorAll("a") : []
    );

    anchors.forEach((anchor) => {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    });

    headers.forEach((header) => {
      setIds((ids) => [
        ...ids,
        {
          id: header.id,
          name: header.innerText,
        },
      ]);
      const id = slugify(header.innerText);
      header.id = id;
      header.className = "scroll-mt-20 sm:scroll-mt-6 group";

      const hashAnchor = document.createElement("a");
      hashAnchor.href = `#${id}`;
      hashAnchor.className =
        "group-hover:opacity-100 opacity-0 ml-1 after:content-['#'] after:text-gray-400 !no-underline";

      header.appendChild(hashAnchor);
    });
  }, []);

  const resizedCoverImg = toWebp(post.coverImage?.url || "");

  return (
    <Layout>
      <main className="container mt-2 lg:mt-12 lg:grid lg:grid-cols-8 lg:gap-10">
        <div className="col-span-6">
          <figure className="flex items-center gap-2">
            {authors.length === 1 ? (
              <>
                <img
                  src={toWebp(authors[0]?.image?.url || "")}
                  className="h-6 w-6 rounded-full bg-honey-400 shadow-2xl [box-shadow:inset_0_0_0_0.5px_#FACE6150] lg:h-8 lg:w-8"
                  alt={`Avatar for ${authors[0]?.name}`}
                />
                <figcaption className="flex flex-col text-xs font-medium text-night-800 dark:text-night-200 sm:text-sm">
                  <span>{authors[0]?.name}</span>
                </figcaption>
              </>
            ) : (
              <div className="flex -space-x-2">
                {authors.map((author) => (
                  <img
                    key={author?.name}
                    src={toWebp(author?.image?.url || "")}
                    className="inline-block h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-900 lg:h-8 lg:w-8"
                    alt={`Avatar for ${author?.name}`}
                  />
                ))}
              </div>
            )}
          </figure>
          <dl className="mt-4 flex items-center text-night-600 dark:text-night-400">
            <div>
              <dt className="sr-only">Publish Date</dt>
              <dl className="text-sm font-medium">
                <span>{post.date}</span>
              </dl>
            </div>
            <div aria-hidden="true" className="mx-2">
              ·
            </div>
            <div>
              <dt className="sr-only">Time to Read</dt>
              <dl className="text-sm font-medium">
                <span>
                  {" "}
                  {decimalToTime((post?.text?.length || 0) / 5 / 180 || 0)}
                </span>
              </dl>
            </div>
          </dl>
          <h1 className="mt-4 overflow-hidden text-xl font-extrabold text-night-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-honey-200 sm:text-2xl lg:text-4xl">
            <Balancer>{post.title}</Balancer>
          </h1>
          <div className="mt-6 gap-2">
            <figure className="relative overflow-hidden rounded-xl">
              <img
                sizes="(min-resolution: 4dppx) and (max-width: 700px) 50vw, (-webkit-min-device-pixel-ratio: 4) and (max-width: 700px) 50vw, (min-resolution: 3dppx) and (max-width: 700px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 700px) 65vw, (min-resolution: 2.5dppx) and (max-width: 700px) 80vw, (-webkit-min-device-pixel-ratio: 2.5) and (max-width: 700px) 80vw, (min-resolution: 2dppx) and (max-width: 700px) 100vw, (-webkit-min-device-pixel-ratio: 2) and (max-width: 700px) 100vw, 700px"
                srcSet={getSrcSet(resizedCoverImg)}
                src={`${resizedCoverImg}&fit=fill&w=700`}
                className="h-full w-full bg-honey-50 shadow"
                alt={post.title || "Cover"}
              />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
            </figure>
          </div>
          <article
            id="content"
            className="prose prose-sm prose-night mt-12 max-w-none dark:prose-invert sm:prose-base lg:prose-lg hover:prose-a:text-ruby-900 prose-blockquote:border-l-ruby-400 prose-pre:relative prose-pre:bg-night-800 prose-pre:after:absolute prose-pre:after:top-0 prose-pre:after:right-0 prose-pre:after:rounded-bl-md prose-pre:after:bg-night-900 prose-pre:after:px-2 prose-pre:after:py-1 prose-pre:after:text-xs prose-pre:after:content-[attr(data-lang)] prose-li:marker:text-ruby-800 prose-img:rounded-lg prose-img:ring-2 prose-img:ring-night-900/10 prose-pre:dark:bg-night-800/50 prose-pre:after:dark:bg-night-800 prose-img:dark:ring-night-500/10"
            dangerouslySetInnerHTML={{
              __html: post.text,
            }}
          />
          <div className="mt-16 rounded-2xl border border-honey-400 bg-honey-25 p-8 dark:border-night-800 dark:bg-[#131D2E] sm:mt-28 sm:p-10">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <div className="space-y-1 text-center sm:mr-24 sm:text-left">
                <p className="text-lg font-bold text-night-900 dark:text-honey-200 lg:text-2xl">
                  Subscribe to our newsletter
                </p>
                <p className="text-sm text-night-700 dark:text-night-500 lg:text-base">
                  Be the first to receive the latest Treasures updates,
                  announcements and more.
                </p>
              </div>
              <a
                href="https://treasuredao.substack.com/"
                rel="noopener noreferrer"
                className="rounded-md bg-ruby-900 py-4 px-5 text-sm font-bold text-white shadow-sm hover:bg-ruby-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ruby-600 sm:py-4 sm:px-7 sm:text-base"
              >
                Subscribe
              </a>
            </div>
          </div>
          {additionalBlogPosts.length > 0 ? (
            <div className="mt-14 border-t border-t-honey-600 py-6 dark:border-t-night-700 sm:mt-20">
              <p className="text-lg font-semibold text-night-900 dark:text-honey-50 sm:text-xl">
                Explore more
              </p>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {additionalBlogPosts.map((post) => (
                  <Link
                    prefetch="intent"
                    to={`/${post?.slug}?${searchParams.toString()}`}
                    key={post?.slug}
                    className="post relative gap-2 sm:gap-4"
                  >
                    <figure className="relative h-48 [grid-area:image]">
                      <img
                        src={toWebp(post?.coverImage?.url || "")}
                        className="h-full w-full rounded-xl object-cover shadow"
                        alt={`Cover for ${post?.title}`}
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
                    </figure>
                    <h3 className="overflow-hidden text-base font-semibold leading-6 text-night-900 [grid-area:title] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-honey-200 sm:text-lg">
                      {post?.title}
                    </h3>
                    <div className="flex items-center space-x-3 [grid-area:author]">
                      <figure className="flex items-center gap-2">
                        {post?.authorCollection?.items.length === 1 ? (
                          <>
                            <img
                              src={toWebp(
                                getAuthors(post)[0]?.image?.url || ""
                              )}
                              className="h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-500"
                              alt={`Avatar for ${getAuthors(post)[0]?.name}`}
                            />
                            <figcaption className="text-xs font-medium text-night-800 dark:text-night-200">
                              <span>{getAuthors(post)[0]?.name}</span>
                            </figcaption>
                          </>
                        ) : (
                          <div className="flex -space-x-2">
                            {authors.map((author) => (
                              <img
                                key={author?.name}
                                src={toWebp(author?.image?.url || "")}
                                className="inline-block h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-500"
                                alt={`Avatar for ${author?.name}`}
                              />
                            ))}
                          </div>
                        )}
                      </figure>
                      <span className="text-xs font-medium text-night-600 [grid-area:date]">
                        <span>{post.date}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <aside className="col-span-2 col-start-7 hidden lg:block">
          <div className="sticky top-20 px-6">
            <ul className="border-l-2 border-honey-600 dark:border-night-600">
              {ids.map((item) => {
                return (
                  <li
                    key={item.name}
                    className={cn(
                      currentHash === item.id
                        ? "border-ruby-900 font-bold text-ruby-900 dark:text-night-100"
                        : "border-transparent text-night-700 dark:text-night-400",
                      "-ml-[2px] overflow-hidden text-ellipsis whitespace-nowrap border-l-2 py-1 pl-4 hover:border-ruby-700 hover:text-ruby-800"
                    )}
                  >
                    <Link
                      to={`/${params.slug}?${searchParams.toString()}#${
                        item.id
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </main>
    </Layout>
  );
}
