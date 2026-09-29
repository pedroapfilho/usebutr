import type { ButtonHTMLAttributes } from "react";

import { type ButtonVariant, buttonClassName } from "@/lib/button-class-name";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button = ({ className, variant = "primary", ...props }: ButtonProps) => (
  <button className={buttonClassName(variant, className)} type="button" {...props} />
);

export { Button };
