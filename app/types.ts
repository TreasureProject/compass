export type EnvVar =
  | "CONTENTFUL_ENDPOINT"
  | "CONTENTFUL_DELIVERY_TOKEN"
  | "CONTENTFUL_MANAGEMENT_TOKEN"
  | "CONTENTFUL_SPACE_ID";

export type Env = {
  [key in EnvVar]: string;
};

export type Optional<T> = T | undefined;
