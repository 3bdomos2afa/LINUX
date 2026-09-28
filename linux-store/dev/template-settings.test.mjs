// Every setting stored in a JSON template or section group must exist in the
// section's schema (and every block type too). Shopify silently ignores
// unknown keys, so a typo here ships as "the setting does nothing".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const theme = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const schemaOf = (type) => {
  const file = path.join(theme, 'sections', `${type}.liquid`);
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return m ? JSON.parse(m[1]) : {};
};
const ids = (settings = []) => new Set(settings.filter((s) => s.id).map((s) => s.id));

const files = [
  ...fs.readdirSync(path.join(theme, 'templates')).filter((f) => f.endsWith('.json')).map((f) => path.join('templates', f)),
  ...fs.readdirSync(path.join(theme, 'templates/customers')).filter((f) => f.endsWith('.json')).map((f) => path.join('templates/customers', f)),
  ...fs.readdirSync(path.join(theme, 'sections')).filter((f) => f.endsWith('.json')).map((f) => path.join('sections', f))
];

for (const rel of files) {
  test(`${rel}: section settings and blocks match their schemas`, () => {
    const data = JSON.parse(fs.readFileSync(path.join(theme, rel), 'utf8'));
    for (const [key, section] of Object.entries(data.sections || {})) {
      const schema = schemaOf(section.type);
      assert.ok(schema, `${rel} → ${key}: section type "${section.type}" does not exist`);
      const allowed = ids(schema.settings);
      for (const setting of Object.keys(section.settings || {})) {
        assert.ok(allowed.has(setting), `${rel} → ${key}: unknown setting "${setting}" for ${section.type}`);
      }
      const blockTypes = new Map((schema.blocks || []).map((b) => [b.type, ids(b.settings)]));
      for (const [blockKey, block] of Object.entries(section.blocks || {})) {
        if (blockTypes.has('@app') && block.type.startsWith('shopify://apps')) continue;
        assert.ok(blockTypes.has(block.type), `${rel} → ${key}.${blockKey}: unknown block type "${block.type}"`);
        for (const setting of Object.keys(block.settings || {})) {
          assert.ok(blockTypes.get(block.type).has(setting), `${rel} → ${key}.${blockKey}: unknown block setting "${setting}"`);
        }
      }
      for (const k of section.block_order || []) assert.ok(section.blocks && section.blocks[k], `${rel} → ${key}: block_order names missing block "${k}"`);
    }
    for (const k of data.order || []) assert.ok(data.sections[k], `${rel}: order names missing section "${k}"`);
  });
}
