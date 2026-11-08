import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertWellFormedXml } from '../scripts/utils/strict-xml.js';

const xml = '<?xml version="1.0" encoding="UTF-8"?>';
test('strict parser accepts valid sitemap and RSS XML structures', () => {
  assert.doesNotThrow(() => assertWellFormedXml(xml +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>https://imadlab.com/</loc></url></urlset>', 'urlset'));
  assert.doesNotThrow(() => assertWellFormedXml(xml +
    '<rss version="2.0"><channel><description><![CDATA[a < b & c]]></description>' +
    '</channel></rss>', 'rss'));
});
test('strict parser rejects unclosed, malformed and unsafe XML', () => {
  for (const value of [
    xml + '<urlset><url></url>',
    xml + '<urlset><url></urlset>',
    xml + '<urlset><loc>A & B</loc></urlset>',
    xml + '<urlset><url></urlset> <another/>',
    xml + '<urlset attr="ok" attr="duplicate"></urlset>',
    xml + '<urlset><![CDATA[broken</urlset>',
    xml + '<urlset>text\u0001</urlset>',
    xml + '<!DOCTYPE x><urlset></urlset>',
  ]) assert.throws(() => assertWellFormedXml(value, 'urlset'));
});
