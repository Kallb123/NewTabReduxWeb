# New Tab Redux Web

A customisable new tab page served as an online web app, deployable to any static hosting provider (e.g. Cloudflare Pages).

Set it as your browser's home page or new tab URL to get a clean, personalised start page with organised link panels.

## Features

- Organised link panels with drag-and-drop reordering
- Customisable background (solid colour, gradient, or Google Earth imagery)
- Light, dark, and system themes
- Inline editing of links and panel titles
- Import / export settings as JSON
- No account required — all data is stored in your browser's `localStorage`

## Live Deployments

Each branch is automatically deployed to Cloudflare Pages:

- **Main branch:** [newtabreduxweb.pages.dev](https://newtabreduxweb.pages.dev/)
- Other branches are accessible via `https://<branch-name>.newtabreduxweb.pages.dev/`

## Usage

Open the deployed URL in your browser and optionally set it as your home page or new tab URL in your browser settings.

## Development

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Tech Stack

- [Vue 3](https://vuejs.org/) + TypeScript
- [Vite](https://vite.dev/)
- Deployed via [Cloudflare Pages](https://pages.cloudflare.com/)

## Repository

[github.com/Kallb123/NewTabReduxWeb](https://github.com/Kallb123/NewTabReduxWeb)
