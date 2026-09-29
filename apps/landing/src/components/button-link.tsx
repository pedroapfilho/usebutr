import type { AnchorHTMLAttributes } from "react";

import { type ButtonVariant, buttonClassName } from "@/lib/button-class-name";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
};

const ButtonLink = ({ children, className, variant = "primary", ...props }: ButtonLinkProps) => (
  <a className={buttonClassName(variant, className)} {...props}>
    {children}
  </a>
);

export { ButtonLink };
