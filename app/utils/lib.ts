import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GetAllBlogPostsQuery } from "~/graphql/app.generated";
import { format } from "./date.server";

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

export const decimalToTime = (minutes: number) =>
  `${
    minutes < 1
      ? `${Math.round(minutes * 60)} sec`
      : `${Math.round(minutes)} min`
  } read`;

export const formatDate = (date: any) =>
  format(Date.parse(date), "MMM. dd, yyyy");
