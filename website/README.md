# Nivyr documentation site

This directory contains the VitePress source for [nivyr-docs.vercel.app](https://nivyr-docs.vercel.app).

## Local development

```sh
npm ci
npm run dev
```

Build and preview the static site with:

```sh
npm run build
npm run preview
```

## Deployment

The Vercel project uses this directory as its root, `npm run build` as its build command, and `.vitepress/dist` as its output directory. Production deployments are promoted through the repository’s Vercel Git integration. The root project’s test configuration excludes this isolated docs toolchain.
