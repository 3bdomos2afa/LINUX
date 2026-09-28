/* Pure selection and pricing rules shared by the studio and its tests. */
(function () {
  'use strict';
  const normalize = (value) => String(value ?? '').trim().toLowerCase();
  const optionIndex = (product, name) => (product?.options || []).findIndex((option) => normalize(option.name || option) === normalize(name));

  function variantFor(product, selection, mapping) {
    if (!product) return null;
    const wanted = [
      [mapping.colorOption, selection.color],
      [mapping.methodOption, mapping.methodValues[selection.method]],
      [mapping.sizeOption, selection.size],
    ];
    const positions = wanted.map(([name, value]) => [optionIndex(product, name), normalize(value)]);
    if (positions[0][0] < 0 || positions[1][0] < 0 || (positions[2][0] < 0 && !mapping.sizeAsProperty)) return null;
    return (product.variants || []).find((variant) => positions.every(([index, value]) => index < 0 || normalize(variant.options[index]) === value)) || null;
  }

  function tiersFrom(tiers) {
    const byQuantity = new Map();
    for (const tier of tiers || []) {
      const quantity = Number(tier.quantity), discount = Number(tier.discount);
      if (Number.isSafeInteger(quantity) && quantity > 1 && Number.isFinite(discount) && discount > 0 && discount < 100) {
        byQuantity.set(quantity, Math.max(discount, byQuantity.get(quantity) || 0));
      }
    }
    let previous = 0;
    return [...byQuantity].sort(([a], [b]) => a - b).flatMap(([quantity, discount]) => {
      if (discount <= previous) return [];
      previous = discount;
      return [{ quantity, discount }];
    });
  }

  function quote(variants, tiers = []) {
    if (!variants.length || variants.some((variant) => !variant?.available)) return null;
    const quantity = variants.length;
    const groups = new Map();
    for (const variant of variants) {
      const group = groups.get(variant.id) || { variant, quantity: 0 };
      group.quantity += 1;
      groups.set(variant.id, group);
    }
    const base = variants.reduce((sum, variant) => sum + Number(variant.price), 0);
    let actual = 0;
    for (const { variant, quantity: count } of groups.values()) {
      const eligibleCount = count + (Number(variant.cart_quantity) || 0);
      const breaks = (variant.quantity_price_breaks || []).filter((tier) => Number(tier.minimum_quantity) <= eligibleCount)
        .sort((a, b) => Number(b.minimum_quantity) - Number(a.minimum_quantity));
      const unit = Number(breaks[0]?.price ?? variant.price);
      actual += unit * count;
    }
    const configured = tiersFrom(tiers);
    const tier = configured.filter((entry) => entry.quantity <= quantity).at(-1) || null;
    // Shopify's actual volume prices take precedence over advertised estimates.
    const estimated = actual === base && !!tier;
    const total = estimated ? variants.reduce((sum, variant) => sum + Math.round(Number(variant.price) * (100 - tier.discount) / 100), 0) : actual;
    return { quantity, base, total, unit: Math.round(total / quantity), savings: base - total, estimated, tier, next: configured.find((entry) => entry.quantity > quantity) || null };
  }

  function groupPieces(variants, sizes) {
    if (variants.length !== sizes.length || !variants.length || variants.some((variant) => !variant?.available) || sizes.some((size) => !size)) return null;
    const groups = new Map();
    variants.forEach((variant, index) => {
      const key = `${variant.id}:${sizes[index]}`;
      const group = groups.get(key) || { id: variant.id, quantity: 0, size: sizes[index], pieces: [] };
      group.quantity += 1;
      group.pieces.push(index + 1);
      groups.set(key, group);
    });
    return [...groups.values()];
  }

  /* Placement presets, relative to the side's print area [cx, cy, w, h] (all in
     % of the square stage). "pocket" is the wearer's left chest, which is the
     viewer's right on a front view. preset.s is the share of the print area the design
     fills (by width, or by height for tall designs); the returned s is the width knob,
     drawn at s × .66% of the stage. */
  const PLACES = {
    front: { center: { y: -0.2, s: 0.58 }, pocket: { x: 0.24, y: -0.3, s: 0.26 }, full: { y: 0, s: 0.92 } },
    back: { upper: { y: -0.28, s: 0.7 }, middle: { y: -0.02, s: 0.8 }, full: { y: 0.02, s: 0.92 } },
  };
  function placementFor(area, side, name, aspect = 1) {
    const preset = PLACES[side] && PLACES[side][name];
    if (!preset || !area) return null;
    const [cx, cy, w, h] = area;
    return { x: cx + (preset.x || 0) * w, y: cy + (preset.y || 0) * h, s: fitWidth(area, preset.s, aspect) / 0.66 };
  }
  /* Widest drawn width (in % of the stage) that fills `share` of the area without
     overflowing its height. aspect = design width / height. */
  function fitWidth(area, share, aspect = 1) {
    const [, , w, h] = area;
    return Math.min(w * share, h * share * (Number(aspect) > 0 ? Number(aspect) : 1));
  }

  /* Print quality: physical width of the design on the garment and the pixel
     density it gets there. printCm is the real width of the side's print area. */
  function printQuality(px, s, areaWidth, printCm) {
    const cm = (Number(s) * 0.66 / Number(areaWidth)) * Number(printCm);
    const dpi = cm > 0 ? Number(px) / (cm / 2.54) : 0;
    return { cm, dpi, level: dpi >= 150 ? 'great' : dpi >= 100 ? 'ok' : 'low' };
  }

  window.LINUX = window.LINUX || {};
  window.LINUX.customizeModel = { variantFor, tiersFrom, quote, groupPieces, placementFor, fitWidth, printQuality };
})();
