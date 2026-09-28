# LINUX — Shopify email notifications (English + Arabic)

> **الدليل بالعربي تحت** · Arabic guide below.

Branded customer emails for linux-eg.com in the storefront's liquid-glass look: dark forest
background, lighter rounded cards, pill buttons, lime accents, right-to-left Arabic. Every file in
`templates/` is complete HTML + Liquid on its own: you paste it into Shopify's notification editor.

## What's in this folder

| Path | What it is |
| --- | --- |
| `templates/en/*.liquid` | English templates (paste these) |
| `templates/ar/*.liquid` | Arabic RTL templates (paste these) |
| `templates/SUBJECTS.md` | The email subject for every template, both languages |
| `assets/email-logo-badge.png` | Logo to upload: cream wordmark on a forest pill, 600×176, transparent corners |
| `assets/email-logo-cream.png` | Optional: cream wordmark on transparent (dark backgrounds only) |
| `_partials.md` | The shared blocks every template contains |
| `src/`, `dev/` | Sources and tools, only needed to change the design (see *For developers*; the delivery zip leaves out `dev/`) |

## Which file goes where

Shopify admin → **Settings → Notifications → Customer notifications**, then open:

| Shopify notification | File (in `templates/en/` and `templates/ar/`) | Sent when |
| --- | --- | --- |
| Order confirmation | `order_confirmation.liquid` | an order is placed |
| Shipping confirmation | `shipping_confirmation.liquid` | you fulfil items (full, partial or last shipment) |
| Shipping update | `shipping_update.liquid` | you edit tracking on a fulfilled order |
| Out for delivery | `out_for_delivery.liquid` | the carrier/app reports "out for delivery" |
| Delivered | `delivered.liquid` | the carrier/app reports "delivered" |
| Order canceled | `order_cancelled.liquid` | you cancel an order with *Send a notification* on |
| Abandoned checkout | `abandoned_checkout.liquid` | a shopper leaves checkout after entering an email |
| Customer account invite | `customer_account_invite.liquid` | you invite a customer (legacy accounts only) |
| Customer account welcome | `customer_account_welcome.liquid` | a customer activates an account (legacy accounts only) |
| Customer account password reset | `customer_password_reset.liquid` | a customer uses *Forgot password* (legacy accounts only) |

What each email shows: order number chip, headline in the brand voice, progress bar
(Placed → Shipped → Out for delivery → Delivered), a lime call-to-action (view order, track
shipment, return to checkout, activate/reset), items with photo, variant, quantity and price,
line discounts, customize-studio details (Garment, Colour, Method, Sides, Size, Pieces, Notes,
Front/Back design *View file* links; the shopper's mockup is used as the photo; keys starting
with `_`, mockup and position data are hidden), totals with discounts and shipping, delivery
address, a cash-on-delivery reminder when payment is pending, and a help card with WhatsApp and
your store email. The abandoned-checkout email is a gentle reminder with the bag and a
return-to-checkout button; it offers no discount.

## Before you paste (once)

1. **Sender email confirmed.** Shopify only lets you edit subjects and bodies after the sender email is confirmed.
2. **Logo.** *Customer notifications → Customize email template* → upload `assets/email-logo-badge.png`,
   set the width to **150 px**, Save. Email apps don't render SVG reliably, so `theme/assets/wordmark.svg`
   can't be used directly. The badge reads well on these dark emails and on Shopify's white default
   emails (refunds, gift cards…), which use the same logo. With no logo uploaded, the templates show a
   text "LINUX" pill instead. Optional: accent colour `#8FCB5A` (only affects emails you don't replace).
3. **WhatsApp number.** Each file starts with an `EDIT ME` block containing
   `assign whatsapp_number = '201110351549'`, copied from *Theme settings → Brand & social*. Change it,
   or set it to `''` to hide the WhatsApp button. The email button uses your sender email (`shop.email`).
   Optional in the same block: `logo_url` (a different PNG just for these emails).
4. **Languages.** This store's default language is English and Arabic is added and published
   (`INSTALL.md`). If yours is the other way round, see *If Arabic is the default language*.
5. Keep a copy of the current code. Shopify can also go back with **Revert to → Previous / Default**.

## Paste the English version (default language)

For every row of the table:

1. Open the notification → **Edit code**.
2. **Email subject**: paste the English subject from `templates/SUBJECTS.md`.
3. **Email body (HTML)**: select everything, delete it, and paste the whole English file
   (from the first `{%- comment -%}` to `</html>`).
4. Click **Preview**, then **Save**.

## Paste the Arabic version (translation)

Arabic goes into the notification's translation, managed by Shopify's free **Translate & Adapt** app:

1. Open the notification → **Localize** (Translate & Adapt opens) → choose **Arabic**.
2. **Email subject**: paste the Arabic subject from `templates/SUBJECTS.md`.
3. **Email body (HTML)**: if the field shows a visual editor, switch it to the code view (`</>`),
   clear it, and paste the whole Arabic file.
4. **Save**. Back on the notification, **Preview** → language drop-down → **Arabic**
   (a translation must be saved before Shopify can preview it).

### If Arabic is the default language

Swap the roles: paste `templates/ar/…` through **Edit code** and `templates/en/…` through
**Localize → English**. Then change `store_url` in each file's `EDIT ME` block: Arabic files
`assign store_url = shop.url`, English files `assign store_url = shop.url | append: '/en'`.

## Test

1. **Preview** each notification in both languages (Shopify's sample data).
2. **Send test email**: it goes to the address you use to log in to the admin. Sample data has no
   customize-studio details, discounts or tracking, so some blocks stay hidden; that is expected.
3. **End-to-end, once:**
   - From `linux-eg.com/ar`, place a test order (for example cash on delivery) with a **new** email
     address → Arabic order confirmation. Repeat on the English store with another new address.
   - Fulfil it with a tracking number → Shipping confirmation; edit the tracking → Shipping update;
     cancel another test order → Order canceled.
   - Start a checkout with an email and leave → Abandoned checkout (after the delay set in your
     abandoned-checkout settings).
   - Order a customize-studio piece → check the mockup photo, the details list and the *View file* links.
4. Open the emails on a phone (Gmail app, iOS Mail) and in desktop Gmail.

Why a new address: Shopify remembers a language on the customer from their first order and keeps
using it. You can change it on the customer's profile.

## How language works: documented vs assumed

**Documented by Shopify**

- "If translations are available for an email notification, then a customer is automatically sent email
  notifications in the language that they placed their order in. You can edit a customer profile to
  change the language of the notifications that a customer receives." Translations are added from
  **Settings → Notifications → (notification) → Localize** with Translate & Adapt, and previewed with the
  language drop-down. — [Localization and translation › Translating checkout and email notifications](https://help.shopify.com/en/manual/international/languages/translate-notifications)
- The notification variables reference has **no locale/language variable**. It does say `line.title`,
  `shipping_method.title` and delivery method names are translated "to the language the customer checked
  out in". — [Notifications variables reference](https://help.shopify.com/en/manual/fulfillment/setup/notifications/email-variables)
- Edit code, Preview, Send test email, custom messages, and `<style>` inlining that keeps media queries.
  — [Customizing email notification templates](https://help.shopify.com/en/manual/fulfillment/setup/notifications/customizing-notification-template)

That is why this kit ships **separate, self-contained English and Arabic files** placed in Shopify's own
translation slot, instead of one file that switches on a language variable.

**Assumed or not documented by Shopify**

- `{% case customer.locale %}` in notifications appears in a third-party blog
  ([reversia.tech, Aug 2026](https://reversia.tech/en/blog/translate-shopify-email-notifications/)) but not
  in Shopify's reference, so it is not used.
- The language is attached to the customer at their first order: a Shopify staff reply in the Community,
  not the docs. — [Community thread (2023)](https://community.shopify.com/t/how-can-i-fix-translation-issues-with-customer-notifications/231572)
- Translate & Adapt accepts a complete HTML replacement in the body translation (Community posts describe
  pasting full template code through the `</>` view). Confirm with Preview → Arabic after saving.
- Arabic product names: the Arabic files use `line.title` (documented as translated) without the variant
  part. If a product isn't translated, the same English→Arabic word list as the storefront is applied
  (Hoodie → هودي, Black → أسود, Print → طباعة …); unknown words stay as they are.
- Totals: `subtotal_price` is after line and order discounts, and `total_price` = subtotal + shipping −
  shipping discount + tax (variables reference), so `shipping_price` is treated as the price **before**
  a shipping discount, the same logic as Shopify's default template quoted by
  [Regios Technologies](https://regiostech.crisp.help/en/article/incorrect-shipping-costs-in-order-confirmation-emails-ioonom/).
  Shopify documents no `taxes_included` variable, so tax-inclusive pricing is detected from the numbers
  and shown as "Includes … in taxes" instead of a tax row.

**Other Liquid used, with sources**: abandoned-checkout link `{{ url }}`
([discounts for abandoned checkout emails](https://help.shopify.com/en/manual/discounts/discounts-for-abandoned-checkout-recovery-emails));
`line | img_url: 'compact_cropped'`, `line.product.title`, `property.first / property.last`
(Shopify's default code in [Order refund for exchanges](https://help.shopify.com/en/manual/fulfillment/setup/notifications/exchange-notifications/order-refund));
`customer.account_activation_url` and `customer.reset_password_url` (the variables in Shopify's default
invite and reset templates); `shop.email_logo_url`, `shop.email_logo_width`, `fulfillment.tracking_numbers`,
`fulfillment.tracking_urls`, `fulfillment.tracking_company`, `order_status_url`, `cancel_reason`,
`financial_status`, `discount_applications`, `line.discount_allocations`, `line.properties` (variables reference).

## Known limitations

- **Account emails (invite, welcome, password reset) only exist with legacy customer accounts**, deprecated
  on 2026-02-26 ([Shopify changelog](https://changelog.shopify.com/posts/legacy-customer-accounts-are-now-deprecated);
  the invite "only works when legacy customer accounts are enabled" —
  [Admin API](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/customerSendAccountInviteEmail)).
  With the new customer accounts (one-time code sign-in) these three are never sent.
- **Out for delivery / Delivered** are sent only when a carrier or fulfilment app reports those tracking
  events. Many Egyptian couriers don't, so these two may never be sent.
- **Estimated delivery** only appears when Shopify provides `fulfillment.estimated_delivery_at` (USPS, FedEx,
  UPS, Canada Post with carrier-calculated rates), so in Egypt it is normally hidden.
- **Abandoned checkout**: if the store sends recovery emails from *Marketing → Automations* (Shopify
  Messaging), that email is edited there and this template is not used.
- **Outlook for Windows** shows square corners and no gradient (the solid colours stay); emoji icons may be
  monochrome. **Dark mode**: the design is already dark, but some apps (Gmail on iOS, Outlook) may still
  shift colours.
- **Size**: sample renders are 11–33 KB. Gmail clips emails over ~102 KB, which would take a very large order.
- The WhatsApp number is repeated in all 20 files: change it in each (or in `src/partials/setup.liquid`, then rebuild).
- Notifications not listed here (refunds, order edits, gift cards, POS, draft-order invoices…) keep Shopify's
  default design and share the logo. Shop app notifications can't be edited by merchants.

## For developers

```bash
cd linux-store/notifications
node dev/build.mjs          # regenerate templates/ and templates/SUBJECTS.md from src/
node dev/build.mjs --check  # fail if templates/ is out of date
node dev/render.mjs         # render every template with dev/sample-data.json and run the checks
node dev/export-logo.mjs    # re-export assets/*.png (needs the agent-browser CLI)
```

`render.mjs` loads liquidjs from `linux-store/dev/node_modules` (run `npm ci` there first), stubs Shopify's
`money`, `money_with_currency`, `img_url` and `format_address`, and fails on unrendered Liquid, images
without alt text, a missing `dir="rtl"`, output over 102 KB, stale templates, or palette contrast below
WCAG AA (4.5:1). Previews are written to `.hoplite/artifacts/notifications/html/`. Copy lives in
`src/strings/{en,ar}.json`, colours in `src/tokens.json`, shared blocks in `src/partials/`
(`_partials.md`). Don't edit `templates/` by hand: it is generated.

---

<div dir="rtl">

# LINUX — إيميلات إشعارات شوبيفاي (عربي + إنجليزي)

إيميلات للعملاء بنفس شكل المتجر (Liquid Glass): خلفية أخضر غامق، كروت أفتح بزوايا مدوّرة، زراير
كبسولة، لمسات لايم، والعربي من اليمين للشمال. كل ملف في `templates/` هو HTML + Liquid كامل لوحده:
بتنسخه وتلزقه في محرر الإشعارات في شوبيفاي.

## الملفات

| المسار | ده إيه |
| --- | --- |
| `templates/en/*.liquid` | القوالب الإنجليزي (دي اللي بتتلزق) |
| `templates/ar/*.liquid` | القوالب العربي RTL (دي اللي بتتلزق) |
| `templates/SUBJECTS.md` | عنوان كل إيميل باللغتين |
| `assets/email-logo-badge.png` | اللوجو اللي هترفعه: كلمة LINUX كريمي على كبسولة خضرا، ‎600×176، والأركان شفافة |
| `assets/email-logo-cream.png` | اختياري: اللوجو كريمي على خلفية شفافة (للخلفيات الغامقة بس) |
| `_partials.md` | الأجزاء المشتركة اللي جوه كل قالب |
| `src/` و`dev/` | المصادر والأدوات، محتاجها بس لو هتغيّر التصميم (ملف التسليم المضغوط مفيهوش `dev/`) |

## كل ملف يروح فين

من أدمن شوبيفاي: **Settings ← Notifications ← Customer notifications**، وافتح:

| الإشعار في شوبيفاي | الملف (في `templates/en/` و`templates/ar/`) | بيتبعت إمتى |
| --- | --- | --- |
| Order confirmation | `order_confirmation.liquid` | أول ما الطلب يتعمل |
| Shipping confirmation | `shipping_confirmation.liquid` | لما تشحن الطلب (كله أو جزء منه أو آخر جزء) |
| Shipping update | `shipping_update.liquid` | لما تعدّل بيانات التتبّع لطلب اتشحن |
| Out for delivery | `out_for_delivery.liquid` | لما شركة الشحن أو التطبيق يبلّغ إن الطلب خرج للتوصيل |
| Delivered | `delivered.liquid` | لما شركة الشحن أو التطبيق يبلّغ إن الطلب وصل |
| Order canceled | `order_cancelled.liquid` | لما تلغي طلب وخيار *Send a notification* شغّال |
| Abandoned checkout | `abandoned_checkout.liquid` | لما حد يكتب إيميله في الدفع ويسيب الطلب |
| Customer account invite | `customer_account_invite.liquid` | لما تبعت دعوة حساب (الحسابات القديمة بس) |
| Customer account welcome | `customer_account_welcome.liquid` | لما العميل يفعّل حسابه (الحسابات القديمة بس) |
| Customer account password reset | `customer_password_reset.liquid` | لما العميل يدوس «نسيت كلمة المرور» (الحسابات القديمة بس) |

كل إيميل فيه: رقم الطلب، عنوان بصوت البراند، شريط مراحل (اتطلب ← اتشحن ← خرج للتوصيل ← وصل)، زرار
لايم للخطوة الجاية (تابع طلبك، تتبّع الشحنة، كمّل الطلب، فعّل الحساب، اختار كلمة مرور جديدة)، القطع
بالصورة والمقاس/اللون والكمية والسعر، الخصومات، تفاصيل استوديو التخصيص (القطعة، اللون، الطريقة،
الجهات، المقاس، القطع، ملاحظاتك، وروابط «عرض الملف» لتصميم قدام/ورا، وصورة المعاينة بتاعة العميل
بتظهر مكان صورة المنتج؛ والمفاتيح اللي بتبدأ بـ `_` وبيانات المعاينة ومكان التصميم مش بتظهر)،
الإجمالي بالخصم والشحن، عنوان التوصيل، تذكير بمبلغ الدفع عند الاستلام لو الدفع لسه ما اكتملش، وكارت
مساعدة فيه واتساب وإيميل المتجر. إيميل الشنطة المتسابة تذكير هادي فيه القطع وزرار «كمّل الطلب»، ومن
غير أي خصم.

## قبل ما تلزق (مرة واحدة)

1. **إيميل المُرسِل لازم يكون متأكد**؛ شوبيفاي مش بيسمح بتعديل العنوان والمحتوى قبل كده.
2. **اللوجو**: *Customer notifications ← Customize email template* ← ارفع `assets/email-logo-badge.png`
   وخلّي العرض **150px** ← Save. برامج الإيميل مش بتعرض SVG كويس، فمش هينفع نستخدم
   `theme/assets/wordmark.svg` مباشرة. البادج ده شكله كويس على الإيميلات الغامقة دي وكمان على إيميلات
   شوبيفاي البيضا الافتراضية (الاسترجاع، كروت الهدايا…) اللي بتستخدم نفس اللوجو. لو مفيش لوجو مرفوع،
   القوالب بتعرض كلمة LINUX في كبسولة. اختياري: لون الـ Accent ‏`#8FCB5A` (بيأثر بس على الإيميلات اللي مش هتغيّرها).
3. **رقم الواتساب**: أول كل ملف فيه جزء `EDIT ME` فيه `assign whatsapp_number = '201110351549'`، منقول من
   *Theme settings ← Brand & social*. غيّره لو لازم، أو خلّيه `''` عشان زرار الواتساب يختفي. زرار الإيميل
   بيستخدم إيميل المتجر (`shop.email`) لوحده. وفي نفس الجزء اختياري: `logo_url` (لوجو PNG مختلف للإيميلات دي بس).
4. **اللغات**: لغة المتجر الأساسية إنجليزي والعربي مضاف ومنشور (حسب `INSTALL.md`). لو العكس، شوف
   «لو العربي هو اللغة الأساسية».
5. خُد نسخة من الكود الحالي. وشوبيفاي كمان يقدر يرجّع بـ **Revert to ← Previous / Default**.

## لزق النسخة الإنجليزي (اللغة الأساسية)

لكل سطر في الجدول:

1. افتح الإشعار ← **Edit code**.
2. **Email subject**: الزق العنوان الإنجليزي من `templates/SUBJECTS.md`.
3. **Email body (HTML)**: حدّد كل اللي فيه وامسحه، والزق الملف الإنجليزي كله (من أول `{%- comment -%}` لحد `</html>`).
4. **Preview** وبعدين **Save**.

## لزق النسخة العربي (الترجمة)

العربي بيتحط في ترجمة الإشعار نفسه، من تطبيق شوبيفاي المجاني **Translate & Adapt**:

1. افتح الإشعار ← **Localize** (هيفتح Translate & Adapt) ← اختار **Arabic**.
2. **Email subject**: الزق العنوان العربي من `templates/SUBJECTS.md`.
3. **Email body (HTML)**: لو الخانة ظاهرة كمحرر مرئي، حوّلها لعرض الكود (`</>`)، امسح اللي فيها، والزق الملف العربي كله.
4. **Save**. ارجع للإشعار ← **Preview** ← من قائمة اللغة اختار **Arabic** (لازم تحفظ الترجمة الأول عشان تقدر تعاينها).

### لو العربي هو اللغة الأساسية

اعكس الأدوار: الزق `templates/ar/…` من **Edit code**، و`templates/en/…` من **Localize ← English**. وبعدين
غيّر `store_url` في جزء `EDIT ME` في كل ملف: الملفات العربي `assign store_url = shop.url`، والإنجليزي
`assign store_url = shop.url | append: '/en'`.

## الاختبار

1. **Preview** لكل إشعار باللغتين (ببيانات شوبيفاي التجريبية).
2. **Send test email**: بيروح على الإيميل اللي بتدخل بيه الأدمن. البيانات التجريبية مفيهاش تفاصيل استوديو
   التخصيص ولا خصومات ولا تتبّع، فأجزاء هتبقى مستخبية؛ ده طبيعي.
3. **تجربة كاملة مرة واحدة:**
   - من `linux-eg.com/ar` اعمل طلب تجريبي (مثلاً دفع عند الاستلام) بإيميل **جديد** ← هيوصلك تأكيد الطلب بالعربي.
     وكرّرها من المتجر الإنجليزي بإيميل جديد تاني.
   - اشحنه برقم تتبّع ← Shipping confirmation؛ عدّل التتبّع ← Shipping update؛ الغي طلب تجريبي تاني ← Order canceled.
   - ابدأ دفع واكتب إيميل وسيب الطلب ← Abandoned checkout (بعد المدة المظبوطة في إعدادات الشنط المتسابة).
   - اطلب قطعة من استوديو التخصيص ← اتأكد من صورة المعاينة وقائمة التفاصيل وروابط «عرض الملف».
4. افتح الإيميلات على الموبايل (تطبيق Gmail وiOS Mail) وعلى Gmail من الكمبيوتر.

ليه إيميل جديد؟ شوبيفاي بيحفظ لغة للعميل من أول طلب وبيفضل يبعتله بيها، وتقدر تغيّرها من صفحة العميل.

## اللغة بتشتغل إزاي: موثّق ولا افتراض

**موثّق من شوبيفاي**

- لو فيه ترجمة للإشعار، العميل بيوصله الإيميل تلقائي **باللغة اللي عمل بيها الطلب**، وتقدر تغيّر لغة إشعارات
  العميل من صفحته. والترجمة بتتضاف من **Settings ← Notifications ← (الإشعار) ← Localize** بتطبيق
  Translate & Adapt، وبتتعاين من قائمة اللغة. —
  [Localization and translation](https://help.shopify.com/en/manual/international/languages/translate-notifications)
- مرجع متغيّرات الإشعارات **مفيهوش متغيّر للغة**، لكنه بيقول إن `line.title` و`shipping_method.title` وأسماء طرق
  التوصيل بتتترجم للغة اللي العميل دفع بيها. — [Notifications variables reference](https://help.shopify.com/en/manual/fulfillment/setup/notifications/email-variables)
- Edit code وPreview وSend test email والرسالة المخصّصة، وإن شوبيفاي بيحوّل الـ `<style>` لـ inline ويحافظ على
  الـ media queries. — [Customizing email notification templates](https://help.shopify.com/en/manual/fulfillment/setup/notifications/customizing-notification-template)

عشان كده القوالب **ملفين منفصلين كاملين، إنجليزي وعربي**، في مكان الترجمة الرسمي بتاع شوبيفاي، مش ملف واحد
بيختار اللغة من متغيّر.

**افتراضات أو حاجات مش موثّقة من شوبيفاي**

- `{% case customer.locale %}` جوه الإشعارات مذكور في مدوّنة خارجية
  ([reversia.tech](https://reversia.tech/en/blog/translate-shopify-email-notifications/)) ومش موجود في مرجع
  شوبيفاي، فمش مستخدم.
- إن اللغة بتتربط بالعميل من أول طلب: ده رد موظف من شوبيفاي في المنتدى، مش في الدليل. —
  [Community](https://community.shopify.com/t/how-can-i-fix-translation-issues-with-customer-notifications/231572)
- إن Translate & Adapt بيقبل كود HTML كامل مكان ترجمة المحتوى (منشورات المنتدى بتوصف لزق كود القالب كله من
  عرض `</>`). اتأكد بـ Preview ← Arabic بعد الحفظ.
- أسماء المنتجات بالعربي: الملفات العربي بتاخد `line.title` (المترجَم حسب شوبيفاي) من غير جزء المقاس/اللون.
  ولو المنتج مش مترجم، بتتطبّق نفس قائمة الكلمات اللي في المتجر (Hoodie ← هودي، Black ← أسود، Print ← طباعة …)،
  والكلمات اللي مش معروفة بتفضل زي ما هي.
- الحساب: `subtotal_price` بعد خصومات القطع والطلب، و`total_price` = المجموع + الشحن − خصم الشحن + الضريبة، فبنعتبر
  `shipping_price` سعر الشحن **قبل** خصم الشحن (نفس منطق قالب شوبيفاي الافتراضي زي ما شرحته
  [Regios](https://regiostech.crisp.help/en/article/incorrect-shipping-costs-in-order-confirmation-emails-ioonom/)).
  ومفيش متغيّر موثّق لـ «الأسعار شاملة الضريبة»، فده بيتعرف من الأرقام نفسها وبيظهر كسطر «الإجمالي شامل ضريبة …».

## حدود معروفة

- **إيميلات الحساب (الدعوة والترحيب واسترجاع كلمة المرور) موجودة بس مع الحسابات القديمة (legacy)**، واللي
  شوبيفاي وقّفها رسمياً في 26 فبراير 2026 ([changelog](https://changelog.shopify.com/posts/legacy-customer-accounts-are-now-deprecated)).
  مع الحسابات الجديدة (الدخول بكود مرة واحدة) التلات إيميلات دول مش بيتبعتوا.
- **Out for delivery وDelivered** بيتبعتوا بس لما شركة الشحن أو تطبيق الشحن يبلّغ بالحالة دي، وشركات شحن كتير في
  مصر مش بتبلّغ، فممكن ما يتبعتوش خالص.
- **ميعاد التوصيل المتوقع** بيظهر بس لو شوبيفاي بعت `fulfillment.estimated_delivery_at` (شركات زي USPS وFedEx وUPS
  وCanada Post)، فغالباً مش هيظهر في مصر.
- **الشنطة المتسابة**: لو المتجر بيبعت الإيميلات دي من *Marketing ← Automations*، يبقى بتتعدّل هناك والقالب ده مش مستخدم.
- **Outlook على ويندوز** بيعرض الزوايا مربعة ومن غير التدرّج (الألوان الأساسية بتفضل)، والإيموجي ممكن يطلع أبيض وأسود.
  **الوضع الليلي**: التصميم غامق أصلاً، بس تطبيقات زي Gmail على iOS وOutlook ممكن تغيّر الألوان شوية.
- **الحجم**: الإيميلات التجريبية بين 11 و33 كيلوبايت. Gmail بيقصّ الإيميل لو عدّى ~102 كيلوبايت، وده محتاج طلب كبير جداً.
- رقم الواتساب متكرّر في الـ 20 ملف: غيّره في كل واحد (أو في `src/partials/setup.liquid` واعمل build تاني).
- الإشعارات اللي مش في الجدول (الاسترجاع، تعديل الطلب، كروت الهدايا، نقاط البيع، فواتير الطلبات المسودة…) بتفضل
  بتصميم شوبيفاي الافتراضي وبتستخدم نفس اللوجو. وإشعارات تطبيق Shop مينفعش التاجر يعدّلها.

## للمطوّرين

نفس أوامر القسم الإنجليزي *For developers*: ‏`node dev/build.mjs` بيولّد `templates/` من `src/`،
و`node dev/render.mjs` بيعرض كل القوالب ببيانات تجريبية ويفحصها. النصوص في `src/strings/{en,ar}.json`، والألوان في
`src/tokens.json`، والأجزاء المشتركة في `src/partials/` (شوف `_partials.md`). ما تعدّلش `templates/` بإيدك: ده ملف متولّد.

</div>
