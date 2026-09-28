# LINUX theme — دليل التحكم من لوحة الأدمن / Admin control guide

**العربي أولاً 👇 / English below**

الدليل ده بيوضح إعدادات الموقع الأساسية اللي تقدر تعدّلها من غير كود.

**قبل النشر:** حسم حقوق تضمين الخطوط واختبار Shopify الحقيقي شرط للتسليم
الإنتاجي؛ راجع [دليل التركيب](INSTALL.md). الخصومات التجريبية مش عروض مفعّلة.

**افتح القالب الصح:** نجمة التخصيص وروابط الموقع بتفتح `/?view=customize`
(وبالعربي `/ar?view=customize`) من **index.customize**. افتح القالب البديل ده
في محرر الثيم واضبط سكشن **Customize studio** فيه. صفحة `/pages/customize`
بقالب **page.customize** اختيارية ولها إعدادات منفصلة؛ تعديل صورها أو أسعارها
مش بيغير وجهة النجمة. راجع الوجهة نفسها بعد الحفظ.

**أولوية الموكبات:** صورة اللون الخاصة، ثم الصورة المشتركة، ثم صورة ظهر الهودي
المدمجة، ثم الرسم الاحتياطي. امسح الصورة الخاصة باللون لو عايز الصورة العامة
الجديدة تظهر. التيشيرت مش متاح للطلب قبل اختيار منتج تيشيرت فعلي.

**الأوفر سايز والعداد:** راجع القياسات الحقيقية في دليل المقاسات من غير اختراع
أبعاد. للعداد، افتح Home → Hero → **Offer countdown** واكتب **Campaign end
timestamp** الحقيقي مع المنطقة الزمنية؛ الخانة الفاضية بتخفيه. اضبط نفس انتهاء
العرض في Shopify Discounts؛ العداد ما بيشغّلش الخصم ولا بيوقفه.

## 1. إعدادات الثيم العامة (Online Store → Themes → Customize → ⚙️ Theme settings)

| المجموعة | اللي تتحكم فيه |
| --- | --- |
| **Appearance** | السكيم (غامق/فاتح) · **ألوان البراند** (الأخضر الغابة، الكريمي، الليموني — سيبها فاضية للافتراضي) · قوة الزجاج · استدارة الزوايا · الحركة · ستارة اللوجو · عرض الصفحة · **حجم النص** و**حجم العناوين** (٪) · خطوط البراند مفعّلة تلقائياً · الفافيكون · صورة المشاركة |
| **Layout & spacing** | المسافة بين السكاشن (٪) · البادينج الجانبي (٪) · **حجم النص على الموبايل** (٪) · إظهار/إخفاء التاب بار تحت · عمود واحد أو عمودين للمنتجات على الموبايل |
| **Navigation** | منيو الموبايل · كلمات البحث الشائعة · إظهار مبدّل اللغة · إظهار المفضلة (القلب) |
| **Cart & checkout** | درج أو صفحة · حد الشحن المجاني · تنبيه "باقي X قطع" · خانة الملاحظات · خانة كود الخصم · اقتراحات "كمّل اللوك" |
| **Product page** | دليل المقاسات · شريط الإضافة اللاصق · شوهدت مؤخراً · تقدير التوصيل ونصوصه · شارة "مطرّز في القاهرة" · زرار المشاركة · الإضافة السريعة من الكارت · اسم البراند على الكارت · السعر المشطوب |
| **404 page** | البحث · المنتجات الشائعة · الكولكشن المستخدم |
| **Footer** | أيقونات الدفع · روابط السياسات · نص "صُنع في" |
| **Brand & social** | رقم الواتساب · **مكان فقاعة الواتساب** (صفحة التخصيص فقط / كل الصفحات / مخفية) · رسالة الواتساب الافتتاحية · روابط إنستجرام / تيك توك / فيسبوك / يوتيوب / X |

## 2. السكاشن (كل صفحة → السكشن → إعداداته)

- **Header**: اللوجو وارتفاعه · المنيو · زرار Shop ونصه ولينكه · شريط الإعلان ونصه · بلوكات صور الميجا منيو. الهيدر ثابت في كل الصفحات: يختفي وانت نازل ويرجع أول ما تطلع.
- **Hero (فيديو التطريز)**: الفيديو · البوستر · ارتفاع الفيديو على الديسكتوب وعلى الموبايل (الافتراضي: الشاشة كلها) · تعتيم الفيديو (الافتراضي: صفر) · **مكان اللوح الزجاجي (تحت الفيديو — الافتراضي — أو فوقه)** · العنوان الصغير/الكبير/الفرعي · الزرارين ولينكاتهم · صف الثقة (3 نصوص). مافيش أزرار على الفيديو.
- **Customize studio** (`/?view=customize`، قالب `index.customize`؛ أو الصفحة الاختيارية بقالب `page.customize`):
  - **المنتجات**: `product` للهودي و`tee_product` للتيشيرت. بيانات الصفحة الحالية تختار `hoodie-customize` للهودي وتترك التيشيرت بدون اختيار؛ اختار منتجات متجرك الفعلية في الحقلين.
  - **الفاريانت والمقاس**: أسماء الخيارات الافتراضية **Color / Size / Type** والقيم **Print / Embroidery**. الاستوديو يطابق الفاريانت المتاح من خيارات المنتج الفعلية، ولا يستبدل الاختيار بفاريانت أول أو بمقاس آخر. أي تركيبة غير موجودة أو غير متاحة تمنع الإضافة. `size_as_property` مطفي افتراضياً؛ فعّله فقط لو المقاس خاص ومش فاريانت في Shopify.
  - **الصور**: أربع خانات مشتركة للهـودي والـتيشيرت، قدام وورا، ومع كل بلوك لون أربع صور بديلة خاصة به. استخدم صور مربعة بنفس القص؛ الصور المرفوعة تفضل بلونها الأصلي. صور ظهر الهودي المدمجة (أسود / أبيض / برجندي / بيج) والموكب المرسوم يفضلوا كـ fallback، ومش محتاج روابط خارجية.
  - **الأسعار**: `volume_pricing_enabled` مقفول افتراضياً. أضف بلوكات `price_tier` للنسب الحقيقية فقط؛ `quantity` هو أقل عدد قطع و`discount` نسبة الخصم، وقيمتها الافتراضية `0`. السعر الإجمالي المعروض تقديري ولا يتحول لخصم دفع بدون خصم Shopify تلقائي مطابق. ممكن التقدير يقرأ شرائح أسعار المتغير لو Shopify وفّرها، لكن الاستوديو ما بيفرضش حد أدنى أو زيادة أو حد أقصى لقواعد B2B. الكتالوج التجريبي المرفق مافيهوش شرائح أسعار؛ سلة Shopify والدفع الفعلي هما المرجع.
  - **الطلب واللمس**: العميل يرفع تصميم مستقل للقدام والورا، ومكان/حجم/دوران كل واحد بيتحفظوا. مقاس كل قطعة يفضل محفوظ؛ القطع ذات الفاريانت والمقاس المتطابق تتجمع في سطر واحد بخاصيتي `Size` و`Piece`. خارج وضع Edit/Move، لوحة القطعة بتعلن CSS `touch-action: pan-y pinch-zoom`؛ الوضع بيفعّل السحب. الاختبارات الآلية بتتأكد إن عجلة الماوس مش محجوزة، لكنها مش اختبار لمس على موبايل فعلي.
- **404**: العنوان الصغير/الكبير/النص · الزرار ولينكه · البطريق · البحث · المنتجات الشائعة وعددها والكولكشن · **بلوكات روابط سريعة** (عنوان، نص، لينك، أيقونة — أو مفتاح ترجمة).
- **Product page**: الفتات · شارة التقييم ونصها · زرار واتساب تحت الإضافة (مطفي افتراضياً) · بلوكات: الوصف / القماش / الشحن / عرض الباندل (الكميات والنسب) / اعرف مقاسك / أكورديون مخصص.
- باقي السكاشن (Marquee, Bestsellers, Collections, Campaign, Shop the look,
  Value props, Statement, Reviews, Instagram, FAQ, Newsletter, Penguins,
  Footer): كلها بلوكات وإعدادات نصوص وصور ولينكات. الخانة الفاضية بتستخدم ترجمة
  الثيم لو كانت مربوطة بمفتاح ترجمة؛ النص اللي تكتبه بنفسك بيفضل زي ما هو ومش
  بيتترجم تلقائياً.

## 3. النصوص الثابتة (أزرار، رسائل، لابلات)

Online Store → Themes → ⋯ → **Edit default theme content**، أو **Translate & Adapt**
للعربي جنب الإنجليزي. الملفان `locales/en.default.json` و`locales/ar.json`
بيترجموا نصوص واجهة الثيم. fallback أسماء المنتجات محدود للكلمات المعروفة،
والكلمات غير المعروفة بتفضل زي ما هي. ترجم أوصاف المنتجات ومحتوى الصفحات
والمدونة والسياسات اللي كتبتها بنفسك عبر Translate & Adapt؛ النص المخصص مش
بيترجم تلقائياً. الخانات الفاضية بتستخدم ترجمة الثيم بس لما تكون مربوطة بمفتاح
ترجمة.

## 4. طلبات التخصيص — إيه اللي بيوصلك في الأوردر

كل طلب تخصيص بيوصل كـ line-item properties على منتج التخصيص:

| الخاصية | القيمة |
| --- | --- |
| Front design / Back design | رابط ملف التصميم الأصلي لكل جهة؛ افتحه من خصائص الطلب وتحقق منه على Shopify الحقيقي |
| **Front mockup / Back mockup** | **صورة JPEG للقطعة بعد وضع التصميم عليها** بنفس المكان والحجم والدوران لكل جهة فيها تصميم؛ راجع رابطها في الطلب |
| Sides | `Front + Back` أو `Front` أو `Back` |
| Garment / Colour / Method | القطعة · اللون · طباعة/تطريز |
| Sizes | مقاس كل قطعة بالترتيب `1:L, 2:M, …` |
| Size / Piece | المقاس المشترك للقطع في السطر، وأرقام القطع المجمّعة فيه؛ المقاسات المختلفة تفضل منفصلة ولا تضيع |
| Front position / Back position | `x:50,y:42,scale:46,rotate:15` (٪ من عرض القطعة + زاوية الدوران) |
| Notes | ملاحظات العميل |

الفاريانت يُختار من Color × Size × Type الفعلية (أو من Color وType فقط عند تفعيل المقاس كخاصية طلب). تركيبة غير متاحة لا تُستبدل تلقائياً. إجمالي الاستوديو تقديري ويتأثر بشرائح سعر المتغير إذا ظهرت في بيانات Shopify، لكنه لا يطبق قواعد B2B للحد الأدنى أو الزيادة أو الحد الأقصى. إعداد الكتالوج التجريبي الحالي فيه القاعدة الافتراضية (حد أدنى قطعة واحدة، بلا حد أقصى، وزيادة قطعة واحدة) ولا يحتوي شرائح أسعار. سلة Shopify الفعلية والدفع هما المرجع.

## 5. الخطوط

- الإنجليزي: **Froople** للعناوين و**Mochi Tubby** لباقي النصوص والأسعار.
- العربي: **Thmanyah Sans** لكل النصوص — Regular 400 للنص، Medium 500 لعناصر
  الواجهة، وBlack 900 للعناوين. الأرقام العربية واللاتينية على صفحات العربي
  بتستخدم الخط نفسه.
- الخطوط مفعّلة تلقائياً؛ **Text size** و**Headline size** لسه قابلين للتعديل.
  `assets/typography.css` بيتحمّل بعد باقي ملفات CSS عشان يثبت نفس عائلة ووزن
  الخط لكل مستويات العناوين.
- ملف خط **Machine** المطلوب مش موجود ضمن المرفقات؛ Mochi Tubby هو الملف السابق ومش بندّعي إنه Machine. إشعار Mochi يسمح بالاستخدام الشخصي فقط، وأرشيف Froople مافيهوش نص رخصة.
- رخصة Thmanyah تسمح بتصميم مواقع تجارية، لكنها بتقيّد تضمين الخط في المواقع والتطبيقات ببرنامج أو تطبيق مجمّع/محزّم/مخفي المصدر، وبتمنع استضافة ملفات الخط أو إتاحتها للاستخراج المستقل، بما في ذلك التضمين على الويب. الثيم الحالي بيحمّل ملفات WOFF2 مباشرةً بـ `@font-face` من روابط Shopify؛ الرخصة ما بتثبتش السماح بطريقة النشر دي. لازم موافقة كتابية صريحة على النشر من CDN، أو إزالة/استبدال الملفات قبل توزيع الثيم. ما تعتبرش ترخيص الويب متحققاً؛ نسخة الـ PDF للمراجعة الداخلية فقط.
- في السكيم الداكن الافتراضي، العناوين كريمي (`#F4E8D8`) والنص أبيض، وعناوين
  الأزرار المملوءة/المعكوسة بتستخدم لون متباين. السكيم الفاتح/Cream بيحتفظ
  بعناوين ونصوص غامقة وواضحة.

---

## English

Where to find the storefront's main no-code settings:

**Before publishing:** clear font-embedding rights and complete a real Shopify
preview test; see [INSTALL.md](INSTALL.md). Local fixture discounts are not live
offers. Order-upload links are provided by Shopify; `/uploads/` is the local
emulator's URL convention, not a guaranteed production path.

**Edit the template actually linked by navigation:** the star and storefront
links open `/?view=customize` (Arabic `/ar?view=customize`), rendered by
**index.customize**. Open that alternate template in the theme editor and edit
its **Customize studio** section. The optional `/pages/customize` page uses
**page.customize** with independent settings; edits there do not update the
star's destination. Verify the linked storefront route after saving.

**Photos and fit:** per-colour upload overrides shared upload, then the built-in
hoodie-back photo and drawn fallback. Clear a colour override to use the shared
photo. Tee ordering stays disabled until a real tee product is selected. Both
garments are oversized; use verified garment measurements in the size guide.

**Countdown:** Home → Hero → **Offer countdown** → **Campaign end timestamp**.
Use the real expiry with an explicit timezone; blank hides the timer. Configure
the same expiry in Shopify Discounts—the timer does not enforce eligibility.

### Theme settings (Customize → ⚙️)
- **Appearance**: scheme, **brand colours** (forest / cream / lime — blank = default), glass strength, radius, motion, curtain, page width, **text size %**, **headline size %** (brand fonts are always enabled), favicon, share image.
- **Layout & spacing**: section gap %, side padding %, **mobile text size %**, bottom tab bar on/off, one or two product columns on phones.
- **Navigation**: mobile menu, popular searches, language switcher on/off, wishlist on/off.
- **Cart & checkout**: drawer/page, free-shipping threshold, low-stock hint, note field, discount-code field, upsell rail.
- **Product page**: size guide, sticky ATC, recently viewed, delivery estimate + texts, "Embroidered in Cairo" chip, share button, card quick-add, vendor on cards, compare-at price.
- **404 page**: search, popular products, collection.
- **Footer**: payment icons, policy links, "Made in" line.
- **Brand & social**: WhatsApp number, **floating WhatsApp bubble scope** (Customize page only / everywhere / hidden), opening message, Instagram / TikTok / Facebook / YouTube / X.

### Sections
- **Hero**: video, poster, desktop & phone height (default: full viewport), dim (default 0), **glass panel placement (below the video — default — or over it)**, eyebrow/headline/subheading, two CTAs and trust row. Nothing sits on the video.
- **Customize studio** (`/?view=customize`, template **index.customize**, or the separately configured optional **page.customize**): choose the hoodie through setting `product` and the tee through `tee_product`. The current template data selects `hoodie-customize` for the hoodie and leaves the tee unset; choose the actual live items. Option-name mappings default to **Color**, **Size** and **Type**, with **Print** / **Embroidery** method values. Variant lookup requires a matching available option combination; missing or unavailable choices are not silently substituted. `size_as_property` is off by default and opts into size-as-property only when size is intentionally not a Shopify variant.
  - Four shared photo pickers cover hoodie front/back and tee front/back; each colour block has four per-colour overrides. Use square photos with matching crops; uploaded photos keep their own colour. Existing black/white/burgundy/beige hoodie-back mockups and the drawn-garment fallback remain available. No external image URLs are required.
- **Pricing**: `volume_pricing_enabled` is off by default. In `price_tier` blocks, `quantity` sets the minimum piece count; the discount percentage field defaults to `0`. Shown totals are estimates, not checkout prices. The estimator can read per-variant `quantity_price_breaks` when Shopify exposes them, but the studio does not enforce B2B rule minimums, increments or maximums. The checked-in preview catalog has no price-break tiers. Shopify's live cart and checkout are authoritative; configure any automatic discounts separately.
- **Orders and touch**: front/back uploads, generated JPEG mockups and each side's position/scale/rotation are order properties. Each piece keeps its size; identical variant-and-size pieces share one order line with `Size` and a `Piece` list. Outside Edit/Move design, the canvas declares CSS `touch-action: pan-y pinch-zoom`; the edit mode enables dragging. Automated checks cover the absence of wheel-event hijacking, not physical-phone touch behavior.
- **404**: copy, CTA, penguin, search, popular products, **quick-link blocks**.
- **Product page**: breadcrumb, rating chip, WhatsApp button (off by default), description / fabric / shipping / bundle / fit-finder / custom accordions.

### Localization

`locales/en.default.json` and `locales/ar.json` localize theme-owned interface
strings. On Arabic product titles, the theme maps a limited set of known words;
unknown words stay unchanged. This is not a general storefront-copy translator: use
Shopify **Translate & Adapt** for merchant-authored product titles/descriptions,
pages, blog posts and policies. An untranslated product description may use the
configured Arabic hoodie/tee fallback copy, but that fallback does not translate
the merchant's English description.

### Order payload from the studio

| Property | What arrives |
| --- | --- |
| `Front design` / `Back design` | Original artwork uploads for each designed side |
| `Front mockup` / `Back mockup` | JPEG preview of the garment with that side's artwork in its saved position |
| `Sides`, `Garment`, `Colour`, `Method` | Selected side(s), garment, colour and Print/Embroidery method |
| `Sizes` | Ordered per-piece list, for example `1:L, 2:M` |
| `Size` / `Piece` | Size and piece numbers for each grouped order line |
| `Front position` / `Back position` | Each side's `x,y,scale,rotate` values |
| `Notes` | Shopper's order note |

The chosen variant matches the mapped **Color × Size × Type** options. Missing
or unavailable combinations are rejected, not replaced with a first-available
variant. Identical variant-and-size pieces share one line, so the order carries
the piece list instead of a separate duplicate line per piece.

### Fonts

English pages use **Froople** for headings and **Mochi Tubby** for all other
copy and prices. Arabic pages use **Thmanyah Sans** throughout: Regular 400 for
body, Medium 500 for UI, Black 900 for headings, including Arabic text and Latin
digits. Brand fonts are always enabled; **Text size** and **Headline size**
remain configurable. `assets/typography.css` loads last to keep all heading
levels consistent. In the default dark scheme, headings are cream (`#F4E8D8`)
and body text is white; filled/inverse button labels retain a contrasting
color. The optional light/Cream scheme uses dark, legible text. The supplied
Thmanyah license permits commercial website design but restricts website/app
embedding to compiled, packaged or obfuscated applications and prohibits
hosting fonts or making font files independently extractable, including through
web embedding. This theme currently serves WOFF2 files from Shopify asset URLs
with `@font-face`, so the current CDN model is not cleared by the license text.
Obtain Thmanyah's explicit written permission for this embedding model or
remove/replace the files before distribution; do not describe webfont rights as
verified. The copied PDF is for internal review only. The requested
**Machine** font file was not supplied; Mochi Tubby remains the earlier font
asset and is not claimed as Machine. Mochi's notice permits personal use only,
and the Froople archive contains no license text. Confirm commercial/web rights
or supply licensed fonts before publishing.
