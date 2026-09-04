import { cn } from "@/lib/cn";

/** The butter mark alone (no wordmark), for the hero watermark. */
const BrandMark = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={cn("h-auto w-40", className)}
    fill="none"
    viewBox="0 0 233 255"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M172.228 133.669c17.48-10.796 31.875-30.332 32.389-56.038C205.131 43.7 177.883 0 121.845 0H82.772C32.903 0 .514 38.559 0 84.829V213.87C0 234.95 14.91 254.486 38.559 255H167.6c34.445 0 64.264-23.649 64.778-57.581 0-26.219-20.05-58.094-60.151-63.75"
      fill="url(#butr-mark-a)"
    />
    <path
      d="M172.228 133.669c-12.853 7.712-29.305 10.797-47.813 11.311-59.123 1.028-89.455 44.214-85.857 92.026l1.029 17.48L167.6 255c34.445 0 64.264-22.621 64.778-57.581.514-26.219-20.05-58.609-60.151-63.75"
      fill="url(#butr-mark-b)"
    />
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="butr-mark-a"
        x1="111.46"
        x2="99.944"
        y1="-.252"
        y2="255.051"
      >
        <stop stopColor="#FDD754" />
        <stop offset="1" stopColor="#F6BA48" />
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="butr-mark-b"
        x1="121.125"
        x2="133.155"
        y1="137.885"
        y2="255.36"
      >
        <stop stopColor="#EDA134" />
        <stop offset="1" stopColor="#F2A337" />
      </linearGradient>
    </defs>
  </svg>
);

export { BrandMark };
