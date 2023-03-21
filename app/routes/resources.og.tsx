// ./app/routes/resource/og.tsx

import type { LoaderArgs } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { contenfulDeliverySdk } from "~/utils/client";

import { generateOgImage } from "~/utils/og.server";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const loader = async ({ request }: LoaderArgs) => {
  const { origin, searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const preview = searchParams?.get("preview") === process.env.PREVIEW_SECRET;

  if (!slug) {
    throw badRequest("Missing slug");
  }

  const res = await contenfulDeliverySdk(preview).getBlogPost({
    slug,
    preview,
  });

  const post = res.blogPostCollection?.items[0];

  if (!post) {
    throw badRequest("Post not found");
  }

  return generateOgImage(post.title || "", origin, preview);
};
