import { cn } from "@/lib/cn";

type BrandLogoProps = {
  className?: string;
};

/**
 * The butr wordmark. A single <picture> swaps the light/dark SVG by
 * `prefers-color-scheme`, matching the docs site and saving an HTTP request
 * versus shipping both variants.
 */
const BrandLogo = ({ className }: BrandLogoProps) => (
  <picture>
    <source media="(prefers-color-scheme: dark)" srcSet="/butr-logo-dark.svg" />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      alt="butr"
      className={cn("h-6 w-auto", className)}
      height={24}
      src="/butr-logo-light.svg"
      width={78}
    />
  </picture>
);

export { BrandLogo };
