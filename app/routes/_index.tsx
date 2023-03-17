import { json } from "@remix-run/node";
import type { MetaFunction, SerializeFrom } from "@remix-run/server-runtime";
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import type { LoaderArgs } from "@remix-run/node";

import { Layout } from "~/components/Layout";
import { getAllCategories } from "~/utils/client";
import { getAuthors, toWebp } from "~/utils/lib";
import type { loader as rootLoader } from "~/root";
import { getSocialMetas, getUrl } from "~/utils/seo";

export const meta: MetaFunction = (args) => {
  const { requestInfo } = args.parentsData.root as SerializeFrom<
    typeof rootLoader
  >;

  return getSocialMetas({
    url: getUrl(requestInfo),
  });
};

const MotionLink = motion(Link);

export const loader = async () => {
  const allCategories = await getAllCategories();

  return json({
    allCategories,
  });
};

export default function Index() {
  const { allCategories } = useLoaderData<typeof loader>();
  const { posts } = useRouteLoaderData("root") as SerializeFrom<
    typeof rootLoader
  >;
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

  const activeCategory = categories.find((category) => category.active);

  const filteredPostsByCategory = posts.filter((post) => {
    if (activeCategory?.name === "all") return true;

    return post?.category?.some(
      (category) => category === activeCategory?.name
    );
  });

  const latestPost = posts[0];

  const authors = getAuthors(latestPost);

  return (
    <Layout>
      {/* main */}
      <main className="container mt-2 xl:mt-16">
        {/* latest blog post */}
        <Link
          to={`/${latestPost?.slug}?${searchParams.toString()}`}
          className="latestPost relative gap-4 py-8"
        >
          <figure className="relative -inset-y-4 inset-x-0 [grid-area:image] lg:absolute">
            <picture className="top-0 left-0 h-full w-full lg:absolute">
              <img
                src={toWebp(latestPost?.coverImage?.url || "")}
                className="h-full w-full rounded-xl object-cover shadow-xl"
                alt=""
              />
            </picture>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-night-900/10 dark:ring-night-500/10"></div>
          </figure>

          <h2 className="text-lg font-semibold text-night-900 [grid-area:title] dark:text-honey-200 lg:pl-8 lg:text-2xl xl:text-3xl">
            {latestPost?.title}
          </h2>
          <p className="text-sm text-night-700 [grid-area:excerpt] dark:text-night-500 lg:pl-8 lg:text-lg">
            {latestPost?.subtitle}
          </p>
          <div className="flex items-center space-x-3 [grid-area:author] lg:pl-8">
            <figure className="flex items-center gap-2">
              {authors.length === 1 ? (
                <>
                  <img
                    src={toWebp(authors[0]?.image?.url || "")}
                    className="h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-500 lg:h-8 lg:w-8"
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
                      className="inline-block h-6 w-6 rounded-full bg-honey-400 ring-2 ring-honey-500 lg:h-8 lg:w-8"
                      alt={`Avatar for ${author?.name}`}
                    />
                  ))}
                </div>
              )}
            </figure>
            <span className="text-xs font-medium text-night-600 [grid-area:date] dark:text-night-500">
              <span>{latestPost.date}</span>
            </span>
          </div>
          <p className="text-sm font-semibold text-ruby-900 [grid-area:readMore] lg:pl-8">
            Read more →
          </p>
        </Link>

        {/* categories */}
        <ul className="mt-6 flex space-x-4 sm:space-x-6 lg:mt-12">
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
                  className="px-0.5 py-1 text-xs font-semibold text-night-900 dark:text-night-100 sm:text-base"
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
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredPostsByCategory.map((post, i) => {
              const authors = post?.authorCollection?.items || [];
              return (
                <MotionLink
                  layout
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
                            src={toWebp(getAuthors(post)[0]?.image?.url || "")}
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
                </MotionLink>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </Layout>
  );
}
