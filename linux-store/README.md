# LINUX — Liquid Glass Shopify theme

Custom Shopify Online Store 2.0 theme for [linux-eg.com](https://linux-eg.com), built in
the Apple iOS 26 "Liquid Glass" language: fully rounded glass panes, the LINUX
forest/cream/lime palette, the penguin mascot woven through the pages, and a
macro embroidery video as the hero. English + Egyptian Arabic (RTL).

**Release status:** the default fonts are now SIL OFL (see *Typography* below), which clears the previous font-licence blocker for the default **Street** and **Bubble** presets; the optional **Classic** preset still needs written permission. Local checks are not a live Shopify import or checkout test. See [INSTALL.md](INSTALL.md).

```
linux-store/
├── theme/   ← the Shopify theme (upload this)
├── dist/    ← packaged zip (node dev/package.mjs)
└── dev/     ← local preview harness + checks (not part of the theme)
```

## Build and install on Shopify

### Build the theme (maintainers)

For repository setup, the root `mise.toml` pins Ruby 3.3.12. With `mise`
installed, run these commands from the repository root; no `sudo` or `apt`
install is needed:

```sh
mise install
npm ci --prefix linux-store/dev
gem install liquid --version 5.8.7 --no-document
npm run package --prefix linux-store/dev
```

Packaging always runs theme-check and the Ruby Shopify-importer validation. If
Ruby/Liquid is missing or the importer reports a finding, packaging fails rather
than silently skipping import validation. The theme zip is written to
`linux-store/dist/linux-liquid-glass-theme.zip`.

### Upload the theme

1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
2. **Customize** the new theme (it stays unpublished until you click Publish):
   - **Theme settings → Appearance**: colours, glass strength, corner radius
     and motion are already tuned. Brand fonts stay enabled automatically;
     adjust **Text size** and **Headline size** if needed.
   - **Theme settings → Brand & social**: WhatsApp and social URLs.
     **Cart & checkout** controls the free-shipping threshold (LE);
     **Product page** controls delivery estimates.
   - **Header**: the menu uses your existing `main-menu`; the mega-menu images
     come from the collections' own images.
   - **Home**: every section is a block you can reorder. Pick the collections
     for *Most wanted* / *Shop by drop* / *Fresh off the machine*, and place
     the two *Shop the look* hotspots on your photo.
   - **Customize studio**: the navigation opens `/?view=customize` (localized
     in Arabic), using **index.customize**. Open that alternate template in the
     theme editor and select the store's hoodie and tee in the
     `product` (hoodie) and `tee_product` (tee) pickers. The studio
     uses the mapped Color, Size and Type options; see the setup notes
     below and [INSTALL.md](INSTALL.md) before publishing. An optional
     `/pages/customize` page uses **page.customize**; its settings are separate
     and must also be configured if you expose that page.
3. Languages: **Settings → Languages → Add Arabic → Publish**. The theme's
   Arabic locale covers theme-owned UI and the storefront flips to RTL. The
   Product-title fallback maps only known words; unknown words stay as written.
   Arabic SEO titles have localized fallbacks for the home page and known
   page and known product titles. Arbitrary merchant-authored article copy and other
   custom copy still need Shopify's **Translate & Adapt**; the theme does not
   translate all store copy automatically.
4. Publish only after font-rights clearance, store setup and live-preview checks.

## Customize studio configuration

- **Products and variants**: `product` selects the hoodie and
  `tee_product` selects the tee. The shipped page settings point the hoodie
  picker at `hoodie-customize` and leave the tee picker unset; choose the live
  hoodie and tee in those fields. Option names default to **Color**,
  **Type** and **Size**, with method values **Print** and **Embroidery**. The
  studio matches an actual available variant and does not silently fall back to
  another size or variant. `size_as_property` is off by default; enable it only
  when a made-to-order size should be stored as an order property instead of a
  native Shopify size variant.
- **Oversized fit**: both garments are described as oversized. Use the store's
  verified garment measurements in its size guide; the theme does not invent
  measurements or guarantee a size from height/weight. Each ordered piece keeps
  its own size when quantity changes.
- **Garment photos**: four shared image pickers set the hoodie front/back and
  tee front/back. Each garment-colour block can override all four views. The
  priority is per-colour upload, shared upload, built-in hoodie-back photo,
  then the drawn fallback. Clear a colour override to use a new shared image. Use
  square images with matching crops; uploaded photos keep their real colours.
  The included hoodie-back mockups (black, white, burgundy and beige) and drawn
  garment fallback are retained; no hard-coded external image URLs are needed.
- **Quantity pricing**: the `volume_pricing_enabled` switch is off by default. Add
  `price_tier` blocks only for real rates: `quantity` is the minimum
  piece count; the discount percentage field defaults to `0`.
  Displayed totals are estimates, not checkout discounts. Configure matching
  Shopify automatic discounts yourself. The estimate can read per-variant
  `quantity_price_breaks` when Shopify exposes them, but this does not
  mean the studio enforces Shopify B2B quantity-rule minimums, increments or
  maximums. The checked-in preview catalog currently has default quantity rules
  (minimum 1, no maximum, increment 1) and no price-break tiers. The live Shopify
  cart and checkout remain authoritative.
- **Order details and touch**: front/back artwork, generated mockups and each
  side's placement metadata are line-item properties. Each piece keeps its
  selected size; pieces with the same variant and size are grouped into one
  order line with `Size` and a `Piece` list. Outside Edit/Move design, the canvas
  declares CSS `touch-action: pan-y pinch-zoom`; Edit/Move enables dragging.
  Node tests verify there is no wheel-event hijack, but the local emulator does
  not establish touch behavior on a physical phone.

## What's inside

| Area | Notes |
| --- | --- |
| `assets/glass.css` | Design tokens and the **Liquid Glass 2** material (lens · tint · sheen · rim · depth; regular / clear / solid / tinted), scroll-edge effect, view transitions, RTL mirroring, buttons, pills, forms |
| `assets/glass.js` | Per-surface **refraction** maps for `[data-lens]` (Chromium only), tab-bar lens, header/tab-bar scroll states, announcement rotator, hero pause, reveal |
| `assets/section-promo.css` + `promo.js` | Offer spotlight, video reels, promo popup (loaded only by those sections) |
| Typography | Theme settings → **Font style**: Street (default — Alexandria + Fustat for Arabic, Unbounded + Fustat for English), Bubble (Baloo Bhaijaan 2 + Bagel Fat One) or Classic (Thmanyah / Froople / Mochi). Split Arabic/Latin WOFF2 with `unicode-range`; wired in `snippets/fonts.liquid` |
| `assets/components.css` | Header + mega menu, hero, marquee, cards, rails, bento, drawers, footer, search, tab bar, toasts |
| `assets/*.js` | Vanilla, dependency-free: AJAX cart + section rendering, predictive search (with Arabic term mapping), wishlist (localStorage), product variants/gallery/sticky ATC/quick view, Customize studio |
| `sections/` | 40 sections incl. all `main-*` templates, hero video, rotating announcement bar (header), **offer spotlight**, **video reels**, **promo popup**, bento collections, campaign, shop-the-look hotspots, testimonials, FAQ, newsletter, penguin row |
| `templates/` | JSON templates for every Shopify template type, plus `password` and `gift_card` |
| `locales/` | `en.default.json`, `ar.json` (Egyptian tone) |
| Hero video | `hero-1080.mp4` (~1 MB, desktop) / `hero-720.mp4` (tablet) / `hero-mobile.mp4` (540×960 portrait crop, ~220 KB) + poster — the browser picks one via `<source media>`; cut from the brand's own embroidery footage with a seamless loop |

**Typography (4.1)** — Theme settings → Appearance → **Font style**:
- **Street** (default): Arabic headings **Alexandria**, Arabic and English body **Fustat** (both by the Cairo type designer Mohamed Gaber), English headings **Unbounded**.
- **Bubble**: **Baloo Bhaijaan 2** (Arabic + English text) with **Bagel Fat One** English headings — the rounded, playful option.
- **Classic**: the previous Thmanyah Sans / Froople / Mochi Tubby set.

Street and Bubble are **SIL Open Font License 1.1** fonts from the official Google Fonts repository (licences and the pinned source commit in `licenses/fonts/`), so they are cleared for your store, for self-hosting and for redistribution with the theme. Each family ships as an Arabic and a Latin WOFF2 with `unicode-range`, so a page downloads only the script it shows (measured on the home page: English ≈ 81 KB and Arabic ≈ 130 KB of fonts, versus 206 KB and 228 KB before). The subsets are unhinted on purpose: the original Alexandria hinting hides the dots of a final ي at some sizes. Rendering was checked in Chrome only; Safari and Windows (where unhinted text can look slightly softer at small sizes) are not checked yet.

The **Classic** fonts are still not cleared: the Mochi archive says *Free for Personal Use*, the Froople archive has no licence text, and the Thmanyah licence restricts hosting the font files for web embedding. Use Classic only with written permission. Two practical gaps as well: Mochi Tubby's own name table reads “All rights reserved”, and Thmanyah has no Arabic thousands separator (٬), so figures that use it fall back to a system font.

## Local preview (no Shopify account needed)

```
npm run start --prefix linux-store/dev   # http://localhost:3000
```

`dev/server.mjs` is a LiquidJS-based emulation of Shopify's Liquid objects,
`{% form %}`/`{% paginate %}`/`{% section %}` tags, ~60 filters, the AJAX Cart
and Section Rendering APIs and predictive search, seeded with a snapshot of the
live catalog (`dev/data/*.json`). It is a best-effort stand-in: always sanity
check on a real Shopify preview theme before publishing.

- `/ar/...` renders the Arabic/RTL storefront.
- `/__device?a=/&b=/products/x&c=/collections/y` shows three phone frames;
  add `&desktop=1` for a 1280px frame.
- `npm run check --prefix linux-store/dev` runs Shopify theme-check.
- `npm test --prefix linux-store/dev` runs the Node commerce, localization and UI regression tests.
- `npm run check:import --prefix linux-store/dev` runs the required Ruby importer check directly.
- With `agent-browser` already on an open storefront route, run
  `agent-browser eval "$(cat linux-store/dev/scripts/verify-typography.js)"`.
  It checks loaded fonts, heading/body colors, Arabic digit font, RTL and
  horizontal overflow. Run it on an English route and an `/ar/...` route.
- The importer check catches strict Liquid-tokenizer, section-schema and template-resource-setting issues that theme-check alone may miss. Packaging always runs it and fails if Ruby/Liquid or a clean result is unavailable. Install the pinned Ruby with `mise install` and Liquid with `gem install liquid --version 5.8.7 --no-document`; no system Ruby, `apt` or `sudo` is required.
