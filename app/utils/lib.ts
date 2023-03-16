import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GetAllBlogPostsQuery } from "~/graphql/app.generated";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getAuthors = (
  post?: NonNullable<
    GetAllBlogPostsQuery["blogPostCollection"]
  >["items"][number]
) => post?.authorCollection?.items ?? [];

export const slugify = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};
