import type { RenderNode } from "@contentful/rich-text-html-renderer";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import type { Block, Inline } from "@contentful/rich-text-types";
import { INLINES } from "@contentful/rich-text-types";
import { BLOCKS } from "@contentful/rich-text-types";
import type { GetBlogPostQuery } from "~/graphql/app.generated";
import { slugify, toWebp } from "./lib";
import highlightjs from "highlight.js";

const textRenderer = (node: Block | Inline) => {
  const element = node.nodeType === BLOCKS.HEADING_2 ? "h2" : "h3";
  if (node.content[0].nodeType === "text") {
    return `<${element} class="scroll-mt-20 sm:scroll-mt-6 group" id="${slugify(
      node.content[0].value
    )}">${node.content[0].value}</${element}>`;
  }

  return "";
};

export const parseDocument = (
  post: NonNullable<
    NonNullable<GetBlogPostQuery>["blogPostCollection"]
  >["items"][number]
) => {
  const { json, links } = post?.text ?? {};

  const renderNodeOptions: RenderNode = {
    [INLINES.HYPERLINK]: (node) => {
      if (node.content[0].nodeType === "text") {
        return `<a href="${node.data.uri}" target="_blank" rel="noopener noreferrer">${node.content[0].value}</a>`;
      }

      return "";
    },
    [BLOCKS.HEADING_2]: textRenderer,
    [BLOCKS.HEADING_3]: textRenderer,
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

  return documentToHtmlString(json, {
    renderNode: renderNodeOptions,
  });
};
