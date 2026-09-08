import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OgCard } from "@/components/og-card";
import { source } from "@/lib/source";

const GET = async (_request: Request, { params }: { params: Promise<{ slug: Array<string> }> }) => {
  const { slug } = await params;
  if (slug.at(-1) !== "image.png") {
    notFound();
  }
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }
  return new ImageResponse(<OgCard description={page.data.description} title={page.data.title} />, {
    height: 630,
    width: 1200,
  });
};

const generateStaticParams = () =>
  source.getPages().map((page) => ({ slug: [...page.slugs, "image.png"] }));

export { generateStaticParams, GET };
