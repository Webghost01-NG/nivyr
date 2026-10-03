import { defineConfig } from "vitepress";

const siteUrl = process.env.NIVYR_DOCS_URL ?? "https://nivyr-docs.vercel.app";
const repository = "https://github.com/Webghost01-NG/nivyr";

export default defineConfig({
  lang: "en-US",
  title: "Nivyr",
  titleTemplate: ":title · Nivyr",
  description: "Integration testing for real Zcash payment lifecycles.",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: siteUrl },
  markdown: {
    codeCopyButton: { tooltipText: "Copy code", copiedText: "Copied" },
  },
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#f6f8f6" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Nivyr" }],
    ["meta", { property: "og:title", content: "Nivyr · Zcash payment lifecycle testing" }],
    ["meta", { property: "og:description", content: "Test the boundaries between broadcast, mining, indexing, wallet scanning, enhancement, and application settlement." }],
    ["meta", { property: "og:image", content: `${siteUrl}/og.svg` }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "Nivyr · Zcash payment lifecycle testing" }],
    ["meta", { name: "twitter:description", content: "Integration testing for Zcash payment applications." }],
    ["meta", { name: "twitter:image", content: `${siteUrl}/og.svg` }],
  ],
  themeConfig: {
    logo: "/nivyr-mark.svg",
    siteTitle: "Nivyr",
    nav: [
      { text: "Guides", link: "/guide/getting-started" },
      { text: "Concepts", link: "/concepts/lifecycle" },
      { text: "API", link: "/api/" },
      { text: "Evidence", link: "/reference/evidence" },
    ],
    sidebar: {
      "/guide/": [
        { text: "Start here", items: [
          { text: "Introduction", link: "/guide/" },
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "First lifecycle test", link: "/guide/first-lifecycle-test" },
          { text: "Testing applications", link: "/guide/testing-applications" },
        ] },
        { text: "Scenarios", items: [
          { text: "Forged txid regression", link: "/guide/forged-txid" },
          { text: "Adapter patterns", link: "/guide/adapter-patterns" },
        ] },
      ],
      "/concepts/": [
        { text: "Core concepts", items: [
          { text: "Lifecycle boundaries", link: "/concepts/lifecycle" },
          { text: "Architecture", link: "/concepts/architecture" },
          { text: "Runtime and Docker", link: "/concepts/runtime" },
          { text: "Security model", link: "/concepts/security" },
        ] },
      ],
      "/api/": [
        { text: "Public API", items: [
          { text: "API overview", link: "/api/" },
          { text: "Nivyr methods", link: "/api/nivyr" },
          { text: "Types and adapters", link: "/api/types" },
        ] },
      ],
      "/reference/": [
        { text: "Reference", items: [
          { text: "CLI", link: "/reference/cli" },
          { text: "Troubleshooting", link: "/reference/troubleshooting" },
          { text: "Supported platforms", link: "/reference/platforms" },
          { text: "Limitations", link: "/reference/limitations" },
          { text: "Evidence", link: "/reference/evidence" },
          { text: "v0.1.0 release notes", link: "/reference/release-notes" },
        ] },
        { text: "Maintainers", items: [
          { text: "Development and releases", link: "/maintainers/" },
          { text: "Contributing", link: "/maintainers/contributing" },
        ] },
      ],
      "/maintainers/": [
        { text: "Maintainers", items: [
          { text: "Development and releases", link: "/maintainers/" },
          { text: "Contributing", link: "/maintainers/contributing" },
        ] },
      ],
    },
    search: { provider: "local" },
    socialLinks: [
      { icon: "github", link: repository },
      { icon: "npm", link: "https://www.npmjs.com/package/@webghost01/nivyr" },
    ],
    outline: { level: [2, 3], label: "On this page" },
    docFooter: { prev: "Previous", next: "Next" },
    footer: {
      message: "Built for Zcash payment developers.",
      copyright: "Nivyr is open source under the MIT License.",
    },
  },
  transformHead({ page, title, description }) {
    const sourcePath = page.replace(/\.md$/, "");
    const route = sourcePath === "index" ? "/" : `/${sourcePath.replace(/\/index$/, "")}`;
    const canonical = new URL(route, siteUrl).href;
    return [
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
    ];
  },
});
