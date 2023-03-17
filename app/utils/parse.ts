import type { RenderNode } from "@contentful/rich-text-html-renderer";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import type { GetBlogPostQuery } from "~/graphql/app.generated";
import { toWebp } from "./lib";
import highlightjs from "highlight.js";

export const parseDocument = (
  post: NonNullable<
    NonNullable<GetBlogPostQuery>["blogPostCollection"]
  >["items"][number]
) => {
  const { json, links } = post?.text ?? {};

  const renderNodeOptions: RenderNode = {
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const entry = links?.entries.block.find((i) => {
        if (i?.__typename === "CodeBlock") {
          return i?.sys.id === node.data.target.sys.id;
        }

        return false;
      });

      if (!entry || entry.__typename !== "CodeBlock") return "";

      const { value: code } = highlightjs.highlight(entry.code || "", {
        language: entry.lang || "plaintext",
      });

      return `<pre data-lang="${entry.lang}"><code>${code}</code></pre>`;
    },
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const img = links?.assets.block.find(
        (i) => i?.sys.id === node.data.target.sys.id
      );

      if (!img) return "";

      return `<img src="${toWebp(img.url || "")}" alt="${img.title}" width="${
        img.width
      }" height="${img.height}" />`;
    },
  };

  return documentToHtmlString(json, { renderNode: renderNodeOptions });
};
