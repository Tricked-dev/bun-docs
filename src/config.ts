export const SITE = {
  title: "Bun.js",
  description: "Bun is a fast all-in-one JavaScript runtime.",
  defaultLanguage: "en_US",
};

export const OPEN_GRAPH = {
  image: {
    src: "https://bun.sh/share.png",
    alt: "Jolly looking bun",
  },
  twitter: "jarredsummer",
};

export const KNOWN_LANGUAGES = {
  English: "en",
};

// Uncomment this to add an "Edit this page" button to every page of documentation.
// TODO: add this
// export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/blob/main/docs/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
export const COMMUNITY_INVITE_URL = `https://bun.sh/discord`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: "XXXXXXXXXX",
//   appId: "XXXXXXXXXX",
//   apiKey: "XXXXXXXXXX",
// };

export const SIDEBAR = {
  en: [
    { text: "Basics", header: true, link: "en/introduction" },
    { text: "Introduction", link: "en/introduction" },
    { text: "Installing", link: "en/installing" },
    { text: "Using bun.js", link: "en/using" },
    { text: "Frameworks", link: "en/frameworks" },
    { text: "Examples", link: "en/examples" },
    { text: "Troubleshooting", link: "en/troubleshooting" },
    { text: "Configuration", link: "en/configuration" },
    { text: "Limitations & intended usage", link: "en/limitations" },
    { text: "Caveats", link: "en/caveats" },
    { text: "Reference", link: "en/bun_install", header: true },
    { text: "bun:install", link: "en/bun_install" },
    { text: "bun:create", link: "en/bun_create" },
    { text: "bun:run", link: "en/bun_run" },
    { text: "bun:bun", link: "en/bun_bun" },
    { text: "bun:upgrade", link: "en/bun_upgrade" },
    { text: "bun:completion", link: "en/bun_completion" },
    { text: "Bun.sqlite", link: "en/bun_sqlite" },
    { text: "Bun.serve", link: "en/bun_serve" },
    { text: "Bun.write", link: "en/bun_write" },
    { text: "Advanced", header: true, link: "en/datatypes" },
    { text: "Datatypes", link: "en/datatypes" },
    { text: "FFI", link: "en/ffi" },
    { text: "Loaders", link: "en/loaders" },
    { text: "Transpiler", link: "en/transpiler" },
    { text: "NodeJS API", link: "en/node_api" },
    { text: "Developing Bun", header: true, link: "en/developing" },
    {
      text: "VSCode Dev Container (Linux)",
      link: "en/developing#vscode-dev-container-linux",
    },
    { text: "macOS", link: "en/developing#macos" },
    { text: "Credits", link: "en/credits" },
  ],
};
