# Shared blocks

Shopify notification templates can't `include` or `render` other files, so every file in
`templates/` carries the complete set of blocks below. `dev/build.mjs` inlines them from
`src/partials/`: change a block once, rebuild, and all 20 files update (`node dev/build.mjs --check`
fails if someone forgot).

## Order inside every template

`file_header` → `setup` (EDIT ME) → `head` → `shell_open` (logo) → hero card (`eyebrow`, `h1`, body,
notices, `steps`, `buttons`/`tracking`) → content cards (items + `totals`, `custom_callout`,
`address`, `help`) → `footer` (closes every table).

## Blocks

| Partial | Used by | What it does |
| --- | --- | --- |
| `file_header` | all | Comment: which notification, language, where to paste, the subject |
| `setup` | all | EDIT ME values (`whatsapp_number`, `logo_url`, `store_url`); first name; Arabic-letter probe |
| `head` | all | `lang`/`dir`, colour-scheme meta, Outlook settings, media queries (≤620px: stacked cards and full-width buttons; ≤360px: tighter padding), hidden preheader |
| `shell_open` | all | 600px shell (Outlook ghost table); logo from `logo_url` → `shop.email_logo_url` → text "LINUX" pill |
| `hero_open` / `hero_close` | all | 28px-radius hero card; gradient sheen with a solid `bgcolor` fallback |
| `card_open` / `card_close` | all | 24px-radius content card with a lighter top edge (the "glass" highlight) |
| `eyebrow`, `h1` | all | Lime chip (order number / context), cream headline |
| `buttons` | most | Lime primary + outline secondary pills; `mso-padding-alt` keeps Outlook's tap area |
| `link_fallback` | checkout, account | The raw link under the button |
| `steps` | shipping family, order confirmation | Placed → Shipped → Out for delivery → Delivered |
| `payment_status` | order confirmation | "Paid ✓", or the cash-on-delivery amount when payment is pending |
| `tracking` | shipping family | Carrier, tracking numbers, ETA; Track shipment + View order; no-tracking fallback |
| `line_item` | item lists | Photo (customize mockup first, else `line \| img_url: 'compact_cropped'`), title, variant, properties, line discounts, quantity, price |
| `line_title.en` / `.ar` | `line_item` | EN: `line.product.title`; AR: translated `line.title` without the variant, then the storefront word list |
| `line_props` | `line_item` | Skips blanks, `_keys`, mockups, positions and the bundle estimate; file URLs become "View file"; each value gets its own text direction |
| `prop_label.*`, `value_map.*` | `line_props`, `line_item` | Storefront vocabulary (القطعة، اللون، الطريقة، قدام/ورا، أسود، طباعة …) |
| `dir_of` | `line_props` | Sets `rtl` when a value contains Arabic, otherwise `ltr`, so typed notes keep their punctuation |
| `line_discounts` | `line_item` | Pills for discounts that target specific lines |
| `totals` | order confirmation, cancelled | Subtotal, order discounts, shipping (+ shipping discount), taxes or "taxes included", total, "You saved" |
| `address` | order + shipping emails | `format_address` + shipping method |
| `custom_callout` | order confirmation | Shown when a line carries customize-studio properties |
| `custom_message` | abandoned checkout, invite | Shopify's optional `{{ custom_message }}` |
| `perks` | invite, welcome | Three benefit tiles |
| `help` | all | WhatsApp (message pre-filled per context) + store email |
| `footer` | all | Tagline, why-you-got-this line, store link |

## Source placeholders (only in `src/`)

`[[key]]` copy from `src/strings/<lang>.json` (template section first, then `common`) ·
`[[c.name]]` colour and `[[s.name]]` style from `src/tokens.json` · `[[> partial]]` a file from
`src/partials/` (`partial.<lang>.liquid` wins over `partial.liquid`). Generated files contain no
placeholders.

## Resolved examples (English)

EDIT ME block (top of every template):

```liquid
{%- assign whatsapp_number = '201110351549' -%}
{%- assign logo_url = '' -%}
{%- assign store_url = shop.url -%}   {%- comment -%} Arabic files: shop.url | append: '/ar' {%- endcomment -%}
```

Logo with text fallback:

```liquid
{%- if lx_logo != blank -%}
<a href="{{ store_url }}" target="_blank" style="text-decoration:none;"><img src="{{ lx_logo }}" alt="{{ shop.name | escape }}" width="{{ lx_logo_w }}" style="display:block;width:{{ lx_logo_w }}px;max-width:240px;height:auto;margin:0 auto;border:0;"></a>
{%- else -%}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;margin:0 auto;">
<tr>
<td bgcolor="#0f3828" style="padding:11px 22px 11px 29px;border-radius:999px;background-color:#0f3828;border:1px solid #284c3c;border-top-color:#4c6757;">
<a href="{{ store_url }}" target="_blank" dir="ltr" style="font-family:'Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:20px;line-height:24px;font-weight:900;letter-spacing:0.34em;color:#f4e8d8;text-decoration:none;">LINUX</a>
</td>
</tr>
</table>
{%- endif -%}
```

Primary button (lime pill, dark text):

```liquid
<td align="center" bgcolor="#8fcb5a" style="border-radius:999px;background-color:#8fcb5a;mso-padding-alt:14px 28px;">
<a class="lx-btn-link" href="{{ lx_btn_url }}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;line-height:20px;font-weight:800;color:#021a12;text-decoration:none;border-radius:999px;">{{ lx_btn_text }}</a>
</td>
```

Fonts are system stacks (no web fonts in email): English `-apple-system, BlinkMacSystemFont, 'Segoe UI',
Roboto, 'Helvetica Neue', Arial, sans-serif`; Arabic `-apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma,
'Noto Kufi Arabic', 'Noto Sans Arabic', 'Geeza Pro', Arial, sans-serif` at 16/28px with no letter-spacing.
