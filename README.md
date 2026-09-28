# LINUX — Shopify storefront theme

This repository contains the LINUX Shopify Online Store 2.0 theme for
[linux-eg.com](https://linux-eg.com). The uploadable theme lives in
[`linux-store/theme/`](linux-store/theme/); the local preview and build tools
live in [`linux-store/dev/`](linux-store/dev/).

## Documentation

- [Theme overview and local preview](linux-store/README.md)
- [Installation and store setup](linux-store/INSTALL.md)
- [Theme editor and order properties](linux-store/ADMIN-GUIDE.md)
- [Checkout branding notes](linux-store/CHECKOUT-BRANDING.md)

## Before deployment

Local checks do not establish a successful Shopify import, file upload or checkout.
Keep the theme unpublished until the store configuration and a real Shopify preview
have been verified. The supplied fonts are **not cleared for commercial webfont
distribution**: resolve the Thmanyah embedding restriction, Mochi's personal-use
notice and Froople's missing license before uploading or distributing those files.
See [the installation guide](linux-store/INSTALL.md) for the release checklist.

## Quick start

Ruby is pinned in the repository-root `mise.toml` (`3.3.12`). With `mise`
installed, prepare the rootless project runtime and dependencies from the
repository root. The managed workspace setup hook runs the `npm ci` and pinned
Liquid gem installation steps after the Ruby runtime is available.

```sh
mise install
npm ci --prefix linux-store/dev
gem install liquid --version 5.8.7 --no-document
npm run start --prefix linux-store/dev
```

The local storefront is at `http://localhost:3000`. To create the Shopify theme
upload and delivery bundle, run `npm run package --prefix linux-store/dev`. The
package command always runs both theme-check and the Ruby Shopify-importer
validator; a missing Ruby/Liquid runtime or any importer finding aborts packaging
instead of silently skipping that check. No `sudo` or `apt` installation is
required for the pinned runtime and project setup.

Run `npm test --prefix linux-store/dev`, `npm run check --prefix linux-store/dev`
and `npm run check:import --prefix linux-store/dev` for the local tests,
theme-check and importer validation. The local preview is a best-effort Shopify
emulator: the live Shopify cart/checkout is authoritative for prices, and the
emulator does not verify touch behavior on a physical phone. Verify the finished
theme and checkout on a real Shopify preview before publishing.

With the managed preview running and `agent-browser` installed, run
`node linux-store/dev/scripts/verify-responsive.mjs` for the bilingual viewport
matrix and `node linux-store/dev/scripts/verify-commerce.mjs` for customization
and cart interactions. The commerce checks mutate only the local preview cart;
their synthetic pricing fixtures do not configure Shopify discounts.
