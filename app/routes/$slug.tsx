import type { LoaderArgs } from "@remix-run/node";
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
import { cn, getAuthors, slugify } from "~/utils/lib";
import { getThemeSession } from "~/utils/theme.server";

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

  const textToString = parseDocument(post);

  return json({
    post: {
      ...post,
      text: textToString,
    },
  });
};

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();
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

  return (
    <Layout>
      <main className="container">
        <h1 className="mt-12 overflow-hidden text-4xl font-bold text-night-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-honey-200">
          {post.title}
        </h1>
        <div className="post mt-6 gap-2">
          <figure className="relative h-96 [grid-area:image]">
            <picture>
              <img
                src={post.coverImage?.url || ""}
                className="aspect-video h-full w-full rounded-xl object-cover object-center shadow"
                alt={post.title || "Cover"}
              />
            </picture>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
          </figure>
          <div className="flex items-center space-x-3 [grid-area:author]">
            <figure className="flex items-center gap-2">
              {authors.length === 1 ? (
                <>
                  <img
                    src={authors[0]?.image?.url || ""}
                    className="h-8 w-8 rounded-full bg-honey-400 shadow-2xl [box-shadow:inset_0_0_0_0.5px_#FACE6150]"
                    alt={`Avatar for ${authors[0]?.name}`}
                  />
                  <figcaption className="flex flex-col text-sm font-medium text-night-800 dark:text-night-200">
                    <span>{authors[0]?.name}</span>
                  </figcaption>
                </>
              ) : (
                <div className="flex -space-x-2">
                  {authors.map((author) => (
                    <img
                      key={author?.name}
                      src={author?.image?.url || ""}
                      className="inline-block h-8 w-8 rounded-full bg-honey-400 ring-2 ring-honey-900"
                      alt={`Avatar for ${author?.name}`}
                    />
                  ))}
                </div>
              )}
            </figure>
            <span className="text-xs font-medium text-night-600 [grid-area:date]">
              <span>Aug. 4th, 2022</span>
            </span>
          </div>
        </div>
        <div className="mt-8 grid lg:grid-cols-8 lg:gap-10">
          <article
            id="content"
            className="prose prose-night col-span-5 dark:prose-invert lg:prose-lg hover:prose-a:text-ruby-900 prose-blockquote:border-l-ruby-400 prose-li:marker:text-ruby-800 prose-img:rounded-lg prose-img:ring-2 prose-img:ring-night-900/10 prose-img:dark:ring-night-500/10"
            dangerouslySetInnerHTML={{
              __html: post.text,
            }}
          />
          <aside className="col-span-2 col-start-7 hidden lg:block">
            <div className="sticky top-20 rounded-lg border-2 border-honey-200 bg-honey-100 p-6 dark:border-night-700 dark:bg-night-800">
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
        </div>
      </main>
    </Layout>
  );
}
