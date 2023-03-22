import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GetAllBlogPostsQuery } from "~/graphql/app.generated";
import { format } from "date-fns";

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

export const formatDate = (date: any) => {
  if (!date) return "";
  return format(Date.parse(date), "MMM. dd, yyyy");
};

export const toWebp = (url: string) => {
  try {
    const u = new URL(url);
    u.searchParams.set("fm", "webp");
    return u.toString();
  } catch (e) {
    return url;
  }
};

export const getSrcSet = (url: string) => {
  const srcSet = [
    `${url}&w=640 640w`,
    `${url}&w=720 720w`,
    `${url}&w=750 750w`,
    `${url}&w=786 786w`,
    `${url}&w=828 828w`,
    `${url}&w=1100 1100w`,
    `${url}&w=1400 1400w`,
  ].join(", ");

  return srcSet;
};
