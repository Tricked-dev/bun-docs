export const SITE = {
  title: "Bun Time",
  description: "Bun is a fast all-in-one JavaScript runtime.",
  defaultLanguage: "en_US",
};

export const OPEN_GRAPH = {
  image: {
    src: "https://bun.sh/logo.svg",
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
//   indexName: 'XXXXXXXXXX',
//   appId: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export const SIDEBAR = {
  en: [
    { text: "", header: true },
    { text: "Basics", header: true },
    { text: "Installing", link: "en/installing" },
    { text: "Using", link: "en/using" },
    { text: "Frameworks", link: "en/frameworks" },
    { text: "Examples", link: "en/examples" },
    { text: "TroubleShooting", link: "en/troubleshooting" },
    { text: "Configuration", link: "en/configuration" },
    { text: "Limitations & intended usage", link: "en/limitations" },
    { text: "Reference", link: "en/reference" },
    { text: "bun:sqlite", link: "en/bun_sqlite" },
    { text: "Bun.serve", link: "en/bun_serve" },
    { text: "Bun.write", link: "en/bun_write" },
    { text: "Advanced", header: true },
    { text: "FFI", link: "en/ffi" },
    { text: "Loaders", link: "en/loaders" },
    { text: "Transpiler", link: "en/transpiler" },
  ],
};
