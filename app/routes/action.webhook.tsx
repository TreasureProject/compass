import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { contenfulDeliverySdk } from "~/utils/client";

const BASE_URL = "https://compass.treasure.lol";

type EntryEvent = {
  fields: {
    category: {
      "en-US": Array<string>;
    };
    subtitle: {
      "en-US": string;
    };
    slug: {
      "en-US": string;
    };
    date: {
      "en-US": string;
    };
    text: {
      "en-US": {
        data: unknown;
        content: Array<{
          content: Array<
            | {
                marks: Array<unknown>;
                value: string;
                nodeType: string;
                data: unknown;
              }
            | {
                data: {
                  uri: string;
                };
                content: Array<{
                  data: unknown;
                  marks: Array<unknown>;
                  value: string;
                  nodeType: string;
                }>;
                nodeType: string;
              }
          >;
          nodeType: string;
          data: unknown;
        }>;
        nodeType: string;
      };
    };
    coverImage: {
      "en-US": {
        sys: {
          type: string;
          linkType: string;
          id: string;
        };
      };
    };
    title: {
      "en-US": string;
    };
    hidden: {
      "en-US": boolean;
    };
    author: {
      "en-US": Array<{
        sys: {
          type: string;
          linkType: string;
          id: string;
        };
      }>;
    };
  };
  metadata: {
    tags: Array<unknown>;
  };
  sys: {
    id: string;
    space: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    environment: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
    contentType: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    revision: number;
    type: "Entry";
    createdBy: {
      sys: {
        type: string;
        linkType: string;
        id: string;
      };
    };
    updatedBy: {
      sys: {
        linkType: string;
        id: string;
        type: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
};

type DeleteEntryEvent = {
  sys: {
    id: string;
    contentType: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    type: "DeletedEntry";
    space: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
    environment: {
      sys: {
        id: string;
        type: string;
        linkType: string;
      };
    };
    revision: number;
  };
};

const purgeCloudflare = async (urls: string[]) => {
  try {
    return fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: "DELETE",
        body: JSON.stringify({
          files: urls,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Key": process.env.CLOUDFLARE_AUTH_KEY,
          "X-Auth-Email": process.env.CLOUDFLARE_AUTH_EMAIL,
        },
      }
    );
  } catch (e) {
    console.error(JSON.stringify(e));
    throw e;
  }
};

export const action = async (args: ActionArgs) => {
  const { request } = args;

  const webhookName = request.headers.get("x-contentful-webhook-name");

  if (webhookName !== process.env.CONTENFUL_WEBHOOK_NAME) {
    throw badRequest("Invalid webhook name");
  }

  if (request.method !== "POST") {
    throw badRequest("Invalid method");
  }

  const payload = (await request.json()) as EntryEvent | DeleteEntryEvent;

  const previewClient = payload.sys.type === "DeletedEntry";

  const blog = await contenfulDeliverySdk(previewClient).findBlogById({
    id: payload.sys.id,
    preview: previewClient,
  });

  if (!blog.blogPost) {
    throw badRequest("Blog not found");
  }

  const urls = [BASE_URL, `${BASE_URL}/${blog.blogPost.slug}`];

  await purgeCloudflare(urls);

  return json({ success: true });
};
