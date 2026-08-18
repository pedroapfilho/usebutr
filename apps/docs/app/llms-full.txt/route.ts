import { cacheLife } from "next/cache";

import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

const getLlmsFull = async () => {
  "use cache";
  cacheLife("max");
  const scanned = await Promise.all(source.getPages().map(getLLMText));
  return scanned.join("\n\n");
};

const GET = async () => new Response(await getLlmsFull());

export { GET };
