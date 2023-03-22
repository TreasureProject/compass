import type { ImageResponseOptions } from "@m5r/og";
import { ImageResponse } from "@m5r/og";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "~/routes/resources.og";

const fontSans = (baseUrl: string) =>
  fetch(new URL(`${baseUrl}/fonts/ABCWhyte-Bold.otf`)).then((res) =>
    res.arrayBuffer()
  );

export const generateOgImage = async (
  title: string,
  origin: string,
  preview: boolean
) => {
  const fontSansData = await fontSans(origin);

  const noCache = process.env.NODE_ENV === "development" || preview;

  const options: ImageResponseOptions = {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: [
      {
        name: "ABCWhyte",
        data: fontSansData,
        style: "normal",
      },
    ],
    headers: {
      "cache-control": noCache
        ? "no-cache, no-store"
        : "public, immutable, no-transform, max-age=31536000",
    },
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: options.width,
          height: options.height,
          fontFamily: "ABCWhyte",
          fontSize: 50,
          backgroundImage: `url(${origin}/img/treasure-bg.jpg)`,
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#FFFAEF",
            position: "absolute",
            width: "100%",
            bottom: "2.5rem",
            left: "4.5rem",
            lineHeight: "3rem",
          }}
        >
          {title}
        </div>
      </div>
    ),
    options
  );
};
