import { libraryOverrides } from "@repo/config-vitest/library";
import reactConfig from "@repo/config-vitest/react";
import { mergeConfig } from "vitest/config";

export default mergeConfig(reactConfig, libraryOverrides);
