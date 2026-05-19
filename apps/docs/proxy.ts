import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { type NextRequest, NextResponse } from "next/server";

const { rewrite } = rewritePath("/docs{/*path}", "/llms.mdx/docs{/*path}");

/**
 * Content negotiation: when an AI agent requests a docs URL with
 * `Accept: text/markdown`, rewrite it to the Markdown route. Browsers
 * (which prefer text/html) keep getting the rendered page.
 */
const proxy = (request: NextRequest) => {
  if (isMarkdownPreferred(request)) {
    const result = rewrite(request.nextUrl.pathname);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
};

export default proxy;
