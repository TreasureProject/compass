import { GraphQLClient } from "graphql-request";

import { getSdk as getExchangeSdk } from "~/graphql/app.generated";

import { createTypeLevelClient, initUntypeable } from "untypeable";

// contentful API
export const contenfulDeliverySdk = (preview = false) =>
  getExchangeSdk(
    new GraphQLClient(process.env.CONTENTFUL_ENDPOINT as string, {
      headers: {
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_DELIVERY_PREVIEW_TOKEN
            : process.env.CONTENTFUL_DELIVERY_TOKEN
        }`,
      },
    })
  );

// used https://transform.tools/json-to-typescript to get this
export interface Root {
  sys: Sys;
  displayField: string;
  name: string;
  description: string;
  fields: Field[];
}

export interface Sys {
  space: Space;
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  environment: Environment;
  publishedVersion: number;
  publishedAt: string;
  firstPublishedAt: string;
  createdBy: CreatedBy;
  updatedBy: UpdatedBy;
  publishedCounter: number;
  version: number;
  publishedBy: PublishedBy;
}

export interface Space {
  sys: Sys2;
}

export interface Sys2 {
  type: string;
  linkType: string;
  id: string;
}

export interface Environment {
  sys: Sys3;
}

export interface Sys3 {
  id: string;
  type: string;
  linkType: string;
}

export interface CreatedBy {
  sys: Sys4;
}

export interface Sys4 {
  type: string;
  linkType: string;
  id: string;
}

export interface UpdatedBy {
  sys: Sys5;
}

export interface Sys5 {
  type: string;
  linkType: string;
  id: string;
}

export interface PublishedBy {
  sys: Sys6;
}

export interface Sys6 {
  type: string;
  linkType: string;
  id: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  localized: boolean;
  required: boolean;
  validations: Validation[];
  disabled: boolean;
  omitted: boolean;
  linkType?: string;
  defaultValue?: DefaultValue;
  items?: Items;
}

export interface Validation {
  enabledMarks?: string[];
  message?: string;
  enabledNodeTypes?: string[];
  nodes?: object;
  linkMimetypeGroup?: string[];
}

export interface DefaultValue {
  "en-US": boolean;
}

export interface Items {
  type: string;
  validations: Validation2[];
}

export interface Validation2 {
  in: string[];
}

const u = initUntypeable();

const router = u.router({
  "/spaces/:spaceId/environments/:environment/content_types/blogPost": u
    .input<{ spaceId: string; environment: string }>()
    .output<Root>(),
});

const BASE_PATH = "https://api.contentful.com";

const contentfulManagementSdk = createTypeLevelClient<typeof router>(
  (path, input = {}) => {
    const pathWithParams = path.replace(
      /:([a-zA-Z0-9_]+)/g,
      (_, key) => input[key]
    );

    return fetch(BASE_PATH + pathWithParams, {
      method: "GET",
      headers: {
        AUthorization: `Bearer ${process.env.CONTENTFUL_MANAGEMENT_TOKEN}`,
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      return res.json();
    });
  }
);

export const getAllCategories = async () => {
  const res = await contentfulManagementSdk(
    "/spaces/:spaceId/environments/:environment/content_types/blogPost",
    {
      spaceId: process.env.CONTENTFUL_SPACE_ID as string,
      environment: "master",
    }
  );

  return res.fields.find((field) => field.id === "category")?.items
    ?.validations[0].in;
};
