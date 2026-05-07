import * as _$resend from "resend";
import { Resend } from "resend";
import React$1, { ReactElement } from "react";
import * as _$react_jsx_runtime0 from "react/jsx-runtime";
import { z } from "zod";

//#region src/client.d.ts
declare const createResendClient: (apiKey: string) => Resend;
//#endregion
//#region src/components/acme-logo.d.ts
type AcmeLogoProps = {
  height?: number;
  width?: number;
};
declare const AcmeLogo: ({
  height,
  width
}: AcmeLogoProps) => _$react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/components/button.d.ts
type ButtonProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
  href: string;
  variant?: "primary" | "outline";
};
declare const Button: ({
  children,
  fullWidth,
  href,
  variant
}: ButtonProps) => _$react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/components/card.d.ts
type CardProps = {
  accent?: boolean;
  children: React.ReactNode;
  title?: string;
};
declare const Card: ({
  accent,
  children,
  title
}: CardProps) => _$react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/components/divider.d.ts
type DividerProps = {
  spacing?: "sm" | "md" | "lg";
};
declare const Divider: ({
  spacing
}: DividerProps) => _$react_jsx_runtime0.JSX.Element;
//#endregion
//#region src/utils/send-email.d.ts
declare const emailConfigSchema: z.ZodObject<{
  bcc: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
  cc: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
  from: z.ZodDefault<z.ZodString>;
  replyTo: z.ZodOptional<z.ZodString>;
  subject: z.ZodString;
  tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
  }, z.core.$strip>>>;
  to: z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>;
}, z.core.$strip>;
type EmailConfig$1 = z.infer<typeof emailConfigSchema>;
type SendEmailOptions = EmailConfig$1 & {
  apiKey: string;
  defaultReplyTo?: string;
  template: ReactElement;
};
declare const sendEmail: ({
  apiKey,
  defaultReplyTo,
  template,
  ...config
}: SendEmailOptions) => Promise<{
  data: _$resend.CreateEmailResponseSuccess;
  error: null;
  success: boolean;
} | {
  data: null;
  error: string;
  success: boolean;
}>;
declare const sendBatchEmails: (emails: Array<SendEmailOptions>, apiKey: string, defaultReplyTo?: string) => Promise<{
  data: _$resend.CreateBatchSuccessResponse<_$resend.CreateBatchRequestOptions>;
  error: null;
  success: boolean;
} | {
  data: null;
  error: string;
  success: boolean;
}>;
declare const previewEmail: (template: ReactElement) => Promise<{
  html: string;
  text: string;
}>;
//#endregion
//#region src/utils/senders.d.ts
type EmailConfig = {
  apiKey: string;
  defaultReplyTo?: string;
  from?: string;
};
declare const sendWelcomeEmail: ({
  userEmail,
  username,
  verificationUrl
}: {
  userEmail: string;
  username?: string;
  verificationUrl: string;
}, config: EmailConfig) => Promise<{
  data: _$resend.CreateEmailResponseSuccess;
  error: null;
  success: boolean;
} | {
  data: null;
  error: string;
  success: boolean;
}>;
declare const sendSignUpAttemptEmail: ({
  resetPasswordUrl,
  signInUrl,
  userEmail,
  username
}: {
  resetPasswordUrl: string;
  signInUrl: string;
  userEmail: string;
  username?: string;
}, config: EmailConfig) => Promise<{
  data: _$resend.CreateEmailResponseSuccess;
  error: null;
  success: boolean;
} | {
  data: null;
  error: string;
  success: boolean;
}>;
declare const sendPasswordResetEmail: ({
  browserInfo,
  ipAddress,
  resetUrl,
  userEmail,
  username
}: {
  browserInfo?: string;
  ipAddress?: string;
  resetUrl: string;
  userEmail: string;
  username?: string;
}, config: EmailConfig) => Promise<{
  data: _$resend.CreateEmailResponseSuccess;
  error: null;
  success: boolean;
} | {
  data: null;
  error: string;
  success: boolean;
}>;
//#endregion
//#region ../../node_modules/tailwindcss/dist/colors.d.mts
declare const _default: {
  inherit: string;
  current: string;
  transparent: string;
  black: string;
  white: string;
  slate: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  gray: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  zinc: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  neutral: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  stone: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  mauve: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  olive: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  mist: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  taupe: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  red: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  orange: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  amber: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  yellow: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  lime: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  green: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  emerald: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  teal: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  cyan: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  sky: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  blue: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  indigo: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  violet: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  purple: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  fuchsia: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  pink: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
  rose: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  };
};
//#endregion
//#region ../../node_modules/tailwindcss/dist/resolve-config-QUZ9b-Gn.d.mts
type NamedUtilityValue = {
  kind: 'named';
  /**
   * ```
   * bg-red-500
   *    ^^^^^^^
   *
   * w-1/2
   *   ^
   * ```
   */
  value: string;
  /**
   * ```
   * w-1/2
   *   ^^^
   * ```
   */
  fraction: string | null;
};
type PluginUtils = {
  theme: (keypath: string, defaultValue?: any) => any;
  colors: typeof _default;
};
//#endregion
//#region ../../node_modules/tailwindcss/dist/types-CJYAW1ql.d.mts
/**
 * The source code for one or more nodes in the AST
 *
 * This generally corresponds to a stylesheet
 */
interface Source {
  /**
   * The path to the file that contains the referenced source code
   *
   * If this references the *output* source code, this is `null`.
   */
  file: string | null;
  /**
   * The referenced source code
   */
  code: string;
}
/**
 * The file and offsets within it that this node covers
 *
 * This can represent either:
 * - A location in the original CSS which caused this node to be created
 * - A location in the output CSS where this node resides
 */
type SourceLocation = [source: Source, start: number, end: number];
type PluginFn = (api: PluginAPI) => void;
type PluginWithConfig = {
  handler: PluginFn;
  config?: UserConfig; /** @internal */
  reference?: boolean;
  src?: SourceLocation | undefined;
};
type PluginWithOptions<T> = {
  (options?: T): PluginWithConfig;
  __isOptionsFunction: true;
};
type Plugin = PluginFn | PluginWithConfig | PluginWithOptions<any>;
type PluginAPI = {
  addBase(base: CssInJs): void;
  addVariant(name: string, variant: string | string[] | CssInJs): void;
  matchVariant<T = string>(name: string, cb: (value: T | string, extra: {
    modifier: string | null;
  }) => string | string[], options?: {
    values?: Record<string, T>;
    sort?(a: {
      value: T | string;
      modifier: string | null;
    }, b: {
      value: T | string;
      modifier: string | null;
    }): number;
  }): void;
  addUtilities(utilities: Record<string, CssInJs | CssInJs[]> | Record<string, CssInJs | CssInJs[]>[], options?: {}): void;
  matchUtilities(utilities: Record<string, (value: string, extra: {
    modifier: string | null;
  }) => CssInJs | CssInJs[]>, options?: Partial<{
    type: string | string[];
    supportsNegativeValues: boolean;
    values: Record<string, string> & {
      __BARE_VALUE__?: (value: NamedUtilityValue) => string | undefined;
    };
    modifiers: 'any' | Record<string, string>;
  }>): void;
  addComponents(utilities: Record<string, CssInJs> | Record<string, CssInJs>[], options?: {}): void;
  matchComponents(utilities: Record<string, (value: string, extra: {
    modifier: string | null;
  }) => CssInJs>, options?: Partial<{
    type: string | string[];
    supportsNegativeValues: boolean;
    values: Record<string, string> & {
      __BARE_VALUE__?: (value: NamedUtilityValue) => string | undefined;
    };
    modifiers: 'any' | Record<string, string>;
  }>): void;
  theme(path: string, defaultValue?: any): any;
  config(path?: string, defaultValue?: any): any;
  prefix(className: string): string;
};
type CssInJs = {
  [key: string]: string | string[] | CssInJs | CssInJs[];
};
type ResolvableTo<T> = T | ((utils: PluginUtils) => T);
type ThemeValue = ResolvableTo<Record<string, unknown>> | null | undefined;
type ThemeConfig = Record<string, ThemeValue> & {
  extend?: Record<string, ThemeValue>;
};
type ContentFile = string | {
  raw: string;
  extension?: string;
};
type DarkModeStrategy = false | 'media' | 'class' | ['class', string] | 'selector' | ['selector', string] | ['variant', string | string[]];
interface UserConfig {
  presets?: UserConfig[];
  theme?: ThemeConfig;
  plugins?: Plugin[];
}
interface UserConfig {
  content?: ContentFile[] | {
    relative?: boolean;
    files: ContentFile[];
  };
}
interface UserConfig {
  darkMode?: DarkModeStrategy;
}
interface UserConfig {
  prefix?: string;
}
interface UserConfig {
  blocklist?: string[];
}
interface UserConfig {
  important?: boolean | string;
}
interface UserConfig {
  future?: 'all' | Record<string, boolean>;
}
interface UserConfig {
  experimental?: 'all' | Record<string, boolean>;
}
//#endregion
//#region ../../node_modules/tailwindcss/dist/lib.d.mts
type Config = UserConfig;
//#endregion
//#region ../../node_modules/react-email/dist/index.d.mts
declare module 'react' {
  interface CSSProperties {
    msoPaddingAlt?: string | number | undefined;
    msoTextRaise?: string | number | undefined;
  }
}
//#endregion
//#region src/components/tailwind/tailwind.d.ts
type TailwindConfig = Omit<Config, 'content'>;
//#endregion
//#region src/styles/theme.d.ts
declare const emailTheme: {
  borderRadius: {
    full: string;
    lg: string;
    md: string;
    sm: string;
    xl: string;
  };
  colors: {
    background: string;
    backgroundDark: string;
    border: string;
    borderDark: string;
    error: string;
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    success: string;
    text: string;
    textDark: string;
    textLight: string;
    textMuted: string;
    warning: string;
  };
  fonts: {
    mono: string;
    sans: string;
  };
  spacing: {
    "2xl": string;
    lg: string;
    md: string;
    sm: string;
    xl: string;
    xs: string;
  };
};
declare const tailwindConfig: {
  presets: TailwindConfig[];
  theme: {
    extend: {
      colors: {
        accent: string;
        "accent-foreground": string;
        background: string;
        border: string;
        card: string;
        "card-foreground": string;
        destructive: string;
        "destructive-foreground": string;
        foreground: string;
        muted: string;
        "muted-foreground": string;
        primary: string;
        "primary-dark": string;
        "primary-foreground": string;
        secondary: string;
        "secondary-dark": string;
        "secondary-foreground": string;
      };
      fontFamily: {
        mono: string;
        sans: string;
      };
    };
  };
};
//#endregion
export { AcmeLogo, Button, Card, Divider, createResendClient, emailTheme, previewEmail, sendBatchEmails, sendEmail, sendPasswordResetEmail, sendSignUpAttemptEmail, sendWelcomeEmail, tailwindConfig };