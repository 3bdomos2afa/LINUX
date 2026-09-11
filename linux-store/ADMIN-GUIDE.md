# LINUX theme — دليل التحكم من لوحة الأدمن / Admin control guide

**العربي أولاً 👇 / English below**

كل نقطة في الموقع ليها مكان تتعدّل منه من غير كود. الدليل ده بيقولك فين.

## 1. إعدادات الثيم العامة (Online Store → Themes → Customize → ⚙️ Theme settings)

| المجموعة | اللي تتحكم فيه |
| --- | --- |
| **Appearance** | السكيم (غامق/فاتح) · **ألوان البراند** (الأخضر الغابة، الكريمي، الليموني — سيبها فاضية للافتراضي) · قوة الزجاج · استدارة الزوايا · الحركة · ستارة اللوجو · عرض الصفحة · **حجم النص** و**حجم العناوين** (٪) · خطوط النظام بدل Rantaro/ثمانية · الفافيكون · صورة المشاركة |
| **Layout & spacing** | المسافة بين السكاشن (٪) · البادينج الجانبي (٪) · **حجم النص على الموبايل** (٪) · إظهار/إخفاء التاب بار تحت · عمود واحد أو عمودين للمنتجات على الموبايل |
| **Navigation** | منيو الموبايل · كلمات البحث الشائعة · إظهار مبدّل اللغة · إظهار المفضلة (القلب) |
| **Cart & checkout** | درج أو صفحة · حد الشحن المجاني · تنبيه "باقي X قطع" · خانة الملاحظات · خانة كود الخصم · اقتراحات "كمّل اللوك" |
| **Product page** | دليل المقاسات · شريط الإضافة اللاصق · شوهدت مؤخراً · تقدير التوصيل ونصوصه · شارة "مطرّز في القاهرة" · زرار المشاركة · الإضافة السريعة من الكارت · اسم البراند على الكارت · السعر المشطوب |
| **404 page** | البحث · المنتجات الشائعة · الكولكشن المستخدم |
| **Footer** | أيقونات الدفع · روابط السياسات · نص "صُنع في" |
| **Brand & social** | رقم الواتساب · **مكان فقاعة الواتساب** (صفحة التخصيص فقط / كل الصفحات / مخفية) · رسالة الواتساب الافتتاحية · روابط إنستجرام / تيك توك / فيسبوك / يوتيوب / X |

## 2. السكاشن (كل صفحة → السكشن → إعداداته)

- **Header**: اللوجو وارتفاعه · المنيو · يطفو فوق الفيديو أو لا · زرار Shop ونصه ولينكه · شريط الإعلان ونصه · بلوكات صور الميجا منيو.
- **Hero (فيديو التطريز)**: الفيديو · البوستر · ارتفاع الفيديو على الديسكتوب وعلى الموبايل · تعتيم الفيديو · زرار الإيقاف · إشارة السكرول · **مكان اللوح الزجاجي (تحت الفيديو — الافتراضي — أو فوقه)** · العنوان الصغير/الكبير/الفرعي · الزرارين ولينكاتهم · صف الثقة (3 نصوص).
- **Customize studio (`/pages/customize`)**: منتج التخصيص · النصوص · القطعة الافتراضية (هودي/تيشيرت) وعرض التيشيرت · الجهة الافتراضية (ورا/قدام) · المقاسات · شيبس الكمية السريعة · الحد الأدنى للتطريز · أقصى كمية · أقصى حجم ملف · بوكس "كلّمنا الأول" · صف "إزاي بتشتغل" ونصوصه · ربط خيارات المنتج (Color / Type / Print / Embroidery).
  - **بلوكات الألوان**: كل لون بلوك — الاسم، لون السواتش، القيمة المطابقة في خيار Color بالمنتج، **صورة ظهر الهودي المدمجة** (أسود / أبيض / برجندي / بيج) أو صورك أنت (ظهر/قدام هودي، قدام/ورا تيشيرت). لو مافيش صورة للجهة، الثيم يرسم موكب بلون السواتش.
- **404**: العنوان الصغير/الكبير/النص · الزرار ولينكه · البطريق · البحث · المنتجات الشائعة وعددها والكولكشن · **بلوكات روابط سريعة** (عنوان، نص، لينك، أيقونة — أو مفتاح ترجمة).
- **Product page**: الفتات · شارة التقييم ونصها · زرار واتساب تحت الإضافة (مطفي افتراضياً) · بلوكات: الوصف / القماش / الشحن / عرض الباندل (الكميات والنسب) / اعرف مقاسك / أكورديون مخصص.
- باقي السكاشن (Marquee, Bestsellers, Collections, Campaign, Shop the look, Value props, Statement, Reviews, Instagram, FAQ, Newsletter, Penguins, Footer): كلها بلوكات وإعدادات نصوص وصور ولينكات، وأي خانة نص فاضية = الثيم يكتب الترجمة (عربي/إنجليزي) بنفسه.

## 3. النصوص الثابتة (أزرار، رسائل، لابلات)

Online Store → Themes → ⋯ → **Edit default theme content**، أو تطبيق **Translate & Adapt** المجاني للعربي جنب الإنجليزي. الملفان: `locales/en.default.json` و`locales/ar.json`.

## 4. طلبات التخصيص — إيه اللي بيوصلك في الأوردر

كل طلب تخصيص بيوصل كـ line-item properties على منتج التخصيص:

| الخاصية | القيمة |
| --- | --- |
| Design file | ملف التصميم الأصلي (لينك `/uploads/…` في Shopify admin) |
| **Mockup** | **صورة JPEG للهودي/التيشيرت بعد وضع التصميم عليه** بنفس المكان والحجم والدوران (لينك `/uploads/…`) |
| Garment / Colour / Side / Method | القطعة · اللون · الجهة (قدام/ورا) · طباعة/تطريز |
| Sizes | مقاس كل قطعة `1:L, 2:M, …` |
| Design position | `x:50,y:42,scale:46,rotate:15,side:back` (٪ من عرض القطعة + زاوية الدوران) |
| Notes | ملاحظات العميل |

الفاريانت المختار = اللون × المقاس الأول × النوع (Print/Embroidery)، فالسعر بيتغيّر تلقائياً.

## 5. الخطوط

- إنجليزي: **Rantaro** للعناوين (النسخة المرفقة ديمو: الأرقام 5–9 مشخبطة فيها عمداً، فالأرقام بتظهر بخط Space Grotesk لحد ما تستبدل `assets/rantaro-latin.woff2` بالنسخة المرخّصة من Limitype) + Space Grotesk للنصوص.
- عربي: **ثمانية Serif Display** للعناوين + **ثمانية Sans** للنصوص (رخصة ثمانية تسمح بالاستخدام في المواقع والبراند وتمنع إعادة توزيع الملفات).

---

## English

Every part of the storefront is editable without code. Where to find it:

### Theme settings (Customize → ⚙️)
- **Appearance**: scheme, **brand colours** (forest / cream / lime — blank = default), glass strength, radius, motion, curtain, page width, **text size %**, **headline size %**, system fonts toggle, favicon, share image.
- **Layout & spacing**: section gap %, side padding %, **mobile text size %**, bottom tab bar on/off, one or two product columns on phones.
- **Navigation**: mobile menu, popular searches, language switcher on/off, wishlist on/off.
- **Cart & checkout**: drawer/page, free-shipping threshold, low-stock hint, note field, discount field, upsell rail.
- **Product page**: size guide, sticky ATC, recently viewed, delivery estimate + texts, "Embroidered in Cairo" chip, share button, card quick-add, vendor on cards, compare-at price.
- **404 page**: search, popular products, collection.
- **Footer**: payment icons, policy links, "Made in" line.
- **Brand & social**: WhatsApp number, **floating WhatsApp bubble scope** (Customize page only / everywhere / hidden), opening message, Instagram / TikTok / Facebook / YouTube / X.

### Sections
- **Hero**: video, poster, desktop & phone height, dim, pause button, scroll hint, **glass panel placement (below the video — default — or over it)**, eyebrow/headline/sub, two CTAs, trust row.
- **Customize studio**: product, copy, default garment & side, offer tee, sizes, quick-qty chips, embroidery minimum, max qty, max file size, contact box, how-it-works row, option mapping; **colour blocks** carry the swatch, the product's Color value and the garment photos (built-in hoodie backs in black / white / burgundy / beige, or your own uploads per side). No photo → drawn recolourable mockup.
- **404**: copy, CTA, penguin, search, popular products, **quick-link blocks**.
- **Product page**: breadcrumb, rating chip, WhatsApp button (off by default), description / fabric / shipping / bundle / fit-finder / custom accordions.

### Order payload from the studio
`Design file` (original upload), **`Mockup`** (JPEG of the garment with the design composited exactly as placed), `Garment`, `Colour`, `Side`, `Method`, `Sizes` (per piece), `Design position` (`x,y,scale,rotate,side`), `Notes`. The variant is resolved from colour × size × Print/Embroidery so pricing follows.

### Fonts
Rantaro (headlines, demo cut — digits fall back to Space Grotesk until the licensed file replaces `assets/rantaro-latin.woff2`) + Space Grotesk for English; Thmanyah Serif Display + Thmanyah Sans for Arabic.
