import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GetAllBlogPostsQuery } from "~/graphql/app.generated";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAuthors = (
  post?: NonNullable<
    GetAllBlogPostsQuery["blogPostCollection"]
  >["items"][number]
) => post?.authorCollection?.items ?? [];
