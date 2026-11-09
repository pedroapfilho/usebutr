import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { source } from "@/lib/source";

const sitemap = (): MetadataRoute.Sitemap =>
  source.getPages().map((page) => ({ url: `${SITE_URL}${page.url}` }));

export default sitemap;
