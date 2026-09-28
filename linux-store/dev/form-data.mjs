// Expand Shopify's multipart items[n][properties][Name] fields without losing arrays.
export function nest(flat) {
  const out = {};
  for (const [key, value] of Object.entries(flat)) {
    const keys = key.replace(/\]/g, '').split('[');
    if (keys.some((part) => ['__proto__', 'constructor', 'prototype'].includes(part))) continue;
    let target = out;
    keys.forEach((part, index) => {
      if (index === keys.length - 1) target[part] = value;
      else target = target[part] = target[part] || (/^\d+$/.test(keys[index + 1]) ? [] : {});
    });
  }
  return out;
}
