import gql from "graphql-tag";

const ITEMS_FRAGMENT = gql`
  fragment ItemsFragment on BlogPost {
    authorCollection(limit: 5) {
      items {
        name
        title
        twitterLink
        discordLink
        image {
          url
        }
      }
    }
    title
    subtitle
    slug
    date
    coverImage {
      url
    }
  }
`;

export const getAllBlogPosts = gql`
  ${ITEMS_FRAGMENT}
  query getAllBlogPosts($preview: Boolean!) {
    blogPostCollection(
      where: { hidden: false }
      order: date_ASC
      preview: $preview
    ) {
      total
      items {
        ...ItemsFragment
      }
    }
  }
`;

export const getBlogPost = gql`
  ${ITEMS_FRAGMENT}
  query getBlogPost($slug: String!, $preview: Boolean!) {
    blogPostCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items {
        ...ItemsFragment
        text {
          json
          links {
            assets {
              block {
                title
                url
                height
                width
                sys {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`;
