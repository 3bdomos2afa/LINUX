#!/usr/bin/env ruby
# Mirrors what Shopify's theme importer rejects (and theme-check misses):
#   1. Ruby-Liquid strict parse of every .liquid file (the tokenizer closes an
#      output tag at the FIRST "}" — a "{x}" inside {{ … }} kills the file)
#   2. Section schema rules: name/block names ≤ 25 chars, labels ≤ 70, select
#      values non-empty, ranges complete, no defaults on resource pickers
#   3. Template JSON: section types exist, resource settings are handles
# Usage: ruby dev/shopify-lint.rb  (from linux-store/) — exit 1 on any finding
require 'liquid'
require 'json'
THEME = File.expand_path('../theme', __dir__)
Dir.chdir(THEME)
class NoopBlock < Liquid::Block; def render(_); ''; end; end
class NoopTag < Liquid::Tag; def render(_); ''; end; end
%w[schema form paginate style javascript stylesheet].each { |t| Liquid::Template.register_tag(t, NoopBlock) }
%w[render section sections layout content_for].each { |t| Liquid::Template.register_tag(t, NoopTag) }
findings = []
Dir.glob('{layout,sections,snippets,templates}/**/*.liquid').sort.each do |f|
  begin
    Liquid::Template.parse(File.read(f), error_mode: :strict, line_numbers: true)
  rescue Liquid::SyntaxError => e
    findings << "#{f}: #{e.message}"
  end
end
def chk(where, arr, findings)
  (arr || []).each do |st|
    next if %w[header paragraph].include?(st['type'])
    findings << "#{where}: setting without id" unless st['id']
    findings << "#{where}: #{st['id']} label > 70 chars" if st['label'].to_s.length > 70
    if %w[select radio].include?(st['type'])
      (st['options'] || []).each { |o| findings << "#{where}: #{st['id']} option with empty value" if o['value'].to_s.empty? }
      findings << "#{where}: #{st['id']} default not in options" if st.key?('default') && !(st['options'] || []).any? { |o| o['value'] == st['default'] }
    end
    if st['type'] == 'range'
      %w[min max step default].each { |k| findings << "#{where}: range #{st['id']} missing #{k}" unless st.key?(k) }
    end
    findings << "#{where}: #{st['type']} #{st['id']} must not have a default" if %w[image_picker product collection blog page article video].include?(st['type']) && st.key?('default')
  end
end
Dir.glob('sections/*.liquid').sort.each do |f|
  s = File.read(f); m = s.match(/\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}/m)
  next unless m
  begin d = JSON.parse(m[1]) rescue findings << "#{f}: schema JSON invalid"; next end
  findings << "#{f}: schema name > 25 chars" if d['name'].to_s.length > 25
  chk(f, d['settings'], findings)
  (d['blocks'] || []).each { |b| findings << "#{f}: block '#{b['name']}' name > 25 chars" if b['name'].to_s.length > 25; chk("#{f}/#{b['type']}", b['settings'], findings) }
end
schema_of = ->(type) { s = File.read("sections/#{type}.liquid"); m = s.match(/\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}/m); m ? JSON.parse(m[1]) : {} }
(Dir.glob('templates/**/*.json') + Dir.glob('sections/*-group.json')).sort.each do |f|
  d = JSON.parse(File.read(f))
  (d['sections'] || {}).each do |sid, sec|
    unless File.exist?("sections/#{sec['type']}.liquid") then findings << "#{f}: #{sid} uses missing section #{sec['type']}"; next end
    sch = schema_of.call(sec['type'])
    types = Hash[(sch['settings'] || []).map { |x| [x['id'], x['type']] }]
    (sec['settings'] || {}).each { |k, v| findings << "#{f}: #{sid}.#{k} must be a handle, not #{v}" if %w[product collection].include?(types[k]) && v.to_s.start_with?('shopify://') }
    btypes = Hash[(sch['blocks'] || []).map { |b| [b['type'], Hash[(b['settings'] || []).map { |x| [x['id'], x['type']] }]] }]
    (sec['blocks'] || {}).each do |bid, b|
      unless btypes.key?(b['type']) then findings << "#{f}: #{sid}/#{bid} unknown block type #{b['type']}"; next end
      (b['settings'] || {}).each { |k, v| findings << "#{f}: #{sid}/#{bid}.#{k} must be a handle, not #{v}" if %w[product collection].include?(btypes[b['type']][k]) && v.to_s.start_with?('shopify://') }
    end
  end
end
findings.each { |x| puts x }
puts "#{findings.size} importer-level findings"
exit(findings.empty? ? 0 : 1)
