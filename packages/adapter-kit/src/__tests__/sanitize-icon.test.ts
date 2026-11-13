import { describe, expect, it } from "vitest";

import { sanitizeIcon } from "../sanitize-icon";

describe("sanitizeIcon", () => {
  it("passes a clean icon through unchanged", () => {
    const icon = "data:image/png;base64,iVBORw0KGgo=";
    expect(sanitizeIcon(icon)).toBe(icon);
  });

  it("trims a leading newline (the Next.js <Image> failure case)", () => {
    expect(sanitizeIcon("\ndata:image/png;base64,iVBORw0KGgo=")).toBe(
      "data:image/png;base64,iVBORw0KGgo=",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeIcon("  data:image/svg+xml;base64,PHN2Zz4=\t\n")).toBe(
      "data:image/svg+xml;base64,PHN2Zz4=",
    );
  });

  it("returns undefined for an all-whitespace icon", () => {
    expect(sanitizeIcon("   \n\t ")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(sanitizeIcon("")).toBeUndefined();
  });

  it("passes undefined through untouched", () => {
    expect(sanitizeIcon(undefined)).toBeUndefined();
  });
});
