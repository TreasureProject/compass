export type EnvVar =
  | "CONTENTFUL_ENDPOINT"
  | "CONTENTFUL_DELIVERY_TOKEN"
  | "CONTENTFUL_DELIVERY_PREVIEW_TOKEN"
  | "CONTENTFUL_MANAGEMENT_TOKEN"
  | "CONTENTFUL_SPACE_ID"
  | "SESSION_SECRET"
  | "PREVIEW_SECRET";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;
