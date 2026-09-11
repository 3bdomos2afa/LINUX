# LINUX — Checkout, Thank-you & Order-status branding

Shopify renders **checkout**, the **thank-you page** and the **order-status page**
itself; a theme cannot change their HTML or CSS (the old `checkout.liquid`
route is retired). Everything below is set once in
**Shopify admin → Settings → Checkout → Customize** (the *Checkout and
accounts editor*) and applies to all three pages plus the new customer
accounts. Takes about ten minutes.

## 1. Colours (Branding → Colors)

Create these palette swatches first, then assign them:

| Swatch | Hex | Use for |
| --- | --- | --- |
| Forest deep | `#021A12` | Page background, order-summary background |
| Forest | `#043020` | Header background, form-field background |
| Forest mist | `#156E4C` | Field borders (at 40 % opacity if offered), dividers |
| Cream | `#F4E8D8` | Headings, primary text |
| White | `#FFFFFF` | Body text, field text |
| Lime | `#8FCB5A` | Primary button, links, accent, checkmarks |
| Lime deep | `#5F9C3A` | Primary button hover |

Assignments:

- **Header** background → Forest · logo on the left · **Header layout: Logo only, centred** on phone.
- **Main content area** background → Forest deep · text → White · headings → Cream.
- **Form fields** → background Forest, border Forest mist, text White, label Cream, **corner radius: Large**.
- **Primary button** → background Lime, text `#021A12`, hover Lime deep, **corner radius: Full (pill)**.
- **Secondary button / links** → Lime text.
- **Order summary** → background Forest deep with a 1-px Forest mist border; product-image radius Large.
- **Accent / checkboxes / radios / progress** → Lime.
- **Error text** → Cream on a Forest chip (the theme never uses red).

## 2. Typography (Branding → Typography)

Shopify's editor only allows fonts from its own library, so the storefront
faces (Matcha Rounded / Disney Bubble / Thmanyah / Palestine) cannot be
uploaded there. Pick the closest library matches so the hand-off feels
continuous:

| Role | Library font | Size | Weight |
| --- | --- | --- | --- |
| Headings (EN) | **Fredoka** (rounded, friendly, closest to Matcha) — fallback *Nunito* | Large | Bold |
| Body (EN) | **Nunito** — fallback *Poppins* | Base | Regular |
| Headings (AR) | **Tajawal** — fallback *Cairo* | Large | Bold |
| Body (AR) | **Tajawal** | Base | Regular |

Letter-case for headings: *Sentence case*. Button text: *Uppercase*.

## 3. Layout & content

- **Logo**: upload `theme/assets/brand-logo-cream.svg` (or the PNG export) at
  *Medium* size, aligned centre.
- **Background image**: none (keep it fast). Optional: set the order-summary
  background to `theme/assets/brand-still-life.webp` at 20 % overlay.
- **Checkout layout**: One-page checkout.
- **Show discount field on mobile**: On.
- **Buy again button** (accounts): On.
- **Thank-you page** — add these blocks in *Thank you → Sections*:
  - *Custom text*: "شكراً — طلبك اتعمل. هنبلّغك على واتساب في كل خطوة."
    / "Thank you — your order is in. We'll message you at every step."
  - *Contact*: WhatsApp link `https://wa.me/<your number>`.
  - Keep *Order details* and *Map* on.
- **Order status page** — same blocks plus *Tracking* when a carrier is set.

## 4. Language

Settings → Languages → **Arabic (ar) published** so checkout switches with the
storefront. Then *Translate & Adapt* → Checkout → review the auto-translations
for: "Shipping", "Cash on delivery", "Discount code", "Order summary". Egyptian
Arabic wording used in the theme (for consistency): الشحن · الدفع عند الاستلام
· كود خصم · ملخص الطلب · كمّل الطلب.

## 5. Customer accounts (new)

Settings → Customer accounts → **New customer accounts** → *Customize* opens
the same editor; the palette from §1 is applied automatically. The storefront
side of the account (dashboard, order page, addresses) is the theme's own
`templates/customers/*` and is already styled.

## 6. What the storefront already covers

The theme's **cart page is the review step** (Step 1 · Bag → 2 · Details →
3 · Payment) with delivery estimate, payment methods, discount and note, so the
shopper arrives at Shopify's checkout with everything already decided.
