import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import React from "react";
import type { LoaderArgs } from "@remix-run/node";

import { Layout } from "~/components/Layout";
import { contenfulDeliverySdk, getAllCategories } from "~/utils/client";
import { getAuthors } from "~/utils/lib";

export const loader = async ({ request }: LoaderArgs) => {
  const requestUrl = new URL(request.url);

  const preview =
    requestUrl?.searchParams?.get("preview") === process.env.PREVIEW_SECRET;

  const allCategories = await getAllCategories();
  const posts = await contenfulDeliverySdk(preview).getAllBlogPosts({
    preview,
  });

  return json({
    allCategories,
    posts,
  });
};

export default function Index() {
  const { allCategories, posts } = useLoaderData<typeof loader>();
  const [categories, setActiveCategories] = React.useState([
    {
      name: "all",
      active: true,
    },
    ...(allCategories || []).map((category) => ({
      name: category,
      active: false,
    })),
  ]);
  const [searchParams] = useSearchParams();

  const allPosts = posts.blogPostCollection?.items || [];

  const latestPost = allPosts[0];

  const authors = getAuthors(latestPost);

  return (
    <Layout>
      {/* main */}
      <main className="container mt-16">
        {/* latest blog post */}
        <Link
          to={`/${latestPost?.slug}?${searchParams.toString()}`}
          className="latestPost relative gap-4 py-8"
        >
          <figure className="absolute -inset-y-4 inset-x-0 [grid-area:image]">
            <picture className="absolute top-0 left-0 h-full w-full">
              <img
                src={latestPost?.coverImage?.url || ""}
                className="h-full w-full rounded-xl object-cover shadow-xl"
                alt=""
              />
            </picture>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
          </figure>

          <h2 className="pl-8 text-3xl font-semibold text-night-900 [grid-area:title] dark:text-honey-200">
            {latestPost?.title}
          </h2>
          <p className="pl-8 text-lg text-night-700 [grid-area:excerpt] dark:text-night-500">
            {latestPost?.subtitle}
          </p>
          <div className="flex items-center space-x-3 pl-8 [grid-area:author]">
            <figure className="flex items-center gap-2">
              {authors.length === 1 ? (
                <>
                  <img
                    src={authors[0]?.image?.url || ""}
                    className="h-8 w-8 rounded-full bg-honey-400 ring-2 ring-honey-500"
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
                      className="inline-block h-8 w-8 rounded-full bg-honey-400 ring-2 ring-honey-500"
                      alt={`Avatar for ${author?.name}`}
                    />
                  ))}
                </div>
              )}
            </figure>
            <span className="text-xs font-medium text-night-600 [grid-area:date] dark:text-night-500">
              <span>Aug. 4th, 2022</span>
            </span>
          </div>
          <p className="pl-8 text-sm font-semibold text-ruby-900 [grid-area:readMore]">
            Read more →
          </p>
        </Link>

        {/* categories */}
        <ul className="mt-12 flex space-x-6">
          {categories.map((category) => {
            return (
              <li key={category.name} className="relative">
                <button
                  onClick={() => {
                    setActiveCategories(
                      categories.map((c) => ({
                        name: c.name,
                        active: c.name === category.name,
                      }))
                    );
                  }}
                  className="px-0.5 py-1 font-semibold text-night-900 dark:text-night-100"
                >
                  <span className="capitalize">{category.name}</span>
                </button>
                {category.active && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-ruby-800"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* posts */}
        <div className="mt-6 grid grid-cols-4 gap-6">
          {allPosts.map((post) => {
            const authors = post?.authorCollection?.items || [];
            return (
              <Link
                to={`/${post?.slug}?${searchParams.toString()}`}
                key={post?.slug}
                className="post relative gap-4"
              >
                <figure className="relative h-48 [grid-area:image]">
                  <img
                    src={post?.coverImage?.url || ""}
                    className="h-full w-full rounded-xl object-cover shadow"
                    alt={`Cover for ${post?.title}`}
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
                </figure>
                <h3 className="overflow-hidden text-lg font-semibold leading-6 text-night-900 [grid-area:title] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-honey-200">
                  {post?.title}
                </h3>
                <div className="flex items-center space-x-3 [grid-area:author]">
                  <figure className="flex items-center gap-2">
                    {post?.authorCollection?.items.length === 1 ? (
                      <>
                        <img
                          src={getAuthors(post)[0]?.image?.url || ""}
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
                            src={author?.image?.url || ""}
                            className="inline-block h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-500"
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
              </Link>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
