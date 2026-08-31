const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.usebutr.com";
const QUICKSTART_URL = `${DOCS_URL}/getting-started/quickstart`;
const INSTALLATION_URL = `${DOCS_URL}/getting-started/installation`;
const INTEGRATIONS_URL = `${DOCS_URL}/integrations/viem`;
const DEMO_URL = process.env.NEXT_PUBLIC_DEMO_URL ?? "https://demo.usebutr.com";
const GITHUB_URL = "https://github.com/pedroapfilho/usebutr";
const NPM_URL = "https://www.npmjs.com/org/usebutr";

const INSTALL_COMMAND = "npm i @usebutr/wallets";

export {
  DOCS_URL,
  QUICKSTART_URL,
  INSTALLATION_URL,
  INTEGRATIONS_URL,
  DEMO_URL,
  GITHUB_URL,
  NPM_URL,
  INSTALL_COMMAND,
};
