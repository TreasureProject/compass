import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import React from "react";
import CompassLogo from "~/assets/CompassLogo.svg";
import CompassText from "~/assets/CompassText.svg";
import { Layout } from "~/components/Layout";

import { contenfulDeliverySdk, getAllCategories } from "~/utils/client";
import { cn, getAuthors } from "~/utils/lib";

export const loader = async () => {
  const allCategories = await getAllCategories();
  const posts = await contenfulDeliverySdk.getAllBlogPosts();

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

  const allPosts = posts.blogPostCollection?.items || [];

  const latestPost = allPosts[0];

  const authors = getAuthors(latestPost);

  return (
    <Layout>
      {/* header */}

      {/* main */}
      <main className="container mt-16">
        {/* latest blog post */}
        <Link
          to={`/${latestPost?.slug}`}
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
          </figure>

          <h2 className="pl-8 text-3xl font-semibold text-night-900 [grid-area:title]">
            {latestPost?.title}
          </h2>
          <p className="pl-8 text-lg text-night-700 [grid-area:excerpt]">
            {latestPost?.subtitle}
          </p>
          <div className="flex items-center space-x-3 pl-8 [grid-area:author]">
            <figure className="flex items-center gap-2">
              {authors.length === 1 ? (
                <>
                  <img
                    src={getAuthors(latestPost)[0]?.image?.url || ""}
                    className="h-8 w-8 rounded-full bg-honey-400 shadow-2xl [box-shadow:inset_0_0_0_0.5px_#FACE6150]"
                    alt={`Avatar for ${getAuthors(latestPost)[0]?.name}`}
                  />
                  <figcaption className="flex flex-col text-sm font-medium text-night-800">
                    <span>{getAuthors(latestPost)[0]?.name}</span>
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
                  className="px-0.5 py-1 font-semibold text-night-900"
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
              <div key={post?.slug} className="post relative gap-4">
                <figure className="h-48 [grid-area:image]">
                  <picture>
                    <img
                      src={post?.coverImage?.url || ""}
                      className="h-full w-full rounded-xl object-cover shadow"
                      alt=""
                    />
                  </picture>
                </figure>
                <h3 className="text-lg font-semibold leading-6 text-night-900 [grid-area:title]">
                  {post?.title}
                </h3>
                <div className="flex items-center space-x-3 [grid-area:author]">
                  <figure className="flex items-center gap-2">
                    {post?.authorCollection?.items.length === 1 ? (
                      <>
                        <img
                          src={getAuthors(post)[0]?.image?.url || ""}
                          className="h-6 w-6 rounded-full bg-honey-400 shadow-2xl ring-2 ring-honey-500"
                          alt={`Avatar for ${getAuthors(post)[0]?.name}`}
                        />
                        <figcaption className="flex flex-col text-xs font-medium text-night-800">
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
              </div>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
