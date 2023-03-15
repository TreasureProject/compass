import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { contenfulDeliverySdk } from "~/utils/client";
import invariant from "tiny-invariant";
import { Layout } from "~/components/Layout";
import { useLoaderData } from "@remix-run/react";
import { notFound } from "remix-utils";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";

export const loader = async (args: LoaderArgs) => {
  const { slug } = args.params;

  invariant(slug, "Slug is required");

  const res = await contenfulDeliverySdk.getBlogPost({
    slug,
  });

  const post = res.blogPostCollection?.items[0];

  if (!post) {
    throw notFound({
      message: `Post with slug ${slug} not found`,
    });
  }

  const textToString = documentToHtmlString(post.text?.json || {});

  return json({
    post: {
      ...post,
      text: textToString,
    },
  });
};

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="container">
        <h1>Blog Post</h1>
        <main
          className="prose prose-night lg:prose-lg hover:prose-a:text-ruby-900 prose-blockquote:border-l-ruby-400 prose-li:marker:text-ruby-300"
          dangerouslySetInnerHTML={{
            __html: post.text,
          }}
        ></main>
      </div>
    </Layout>
  );
}
