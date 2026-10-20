import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { loadDisclosureDenylist, disclosureFindings } from '../disclosure-denylist';

const distributionDirectory = resolve(__dirname, '../../dist');
const built = existsSync(distributionDirectory);

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
  });
}

const TEXT_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.css', '.xml', '.json', '.txt', '.webmanifest', '.svg']);
const SECRET_VALUE_SHAPES = [/sk_(live|test)_[A-Za-z0-9]{8,}/, /whsec_[A-Za-z0-9]{8,}/, /SG\.[A-Za-z0-9_-]{16,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];

describe('the public build discloses nothing private', () => {
  test('the built site exists, so the disclosure checks below are not vacuous', () => {
    expect(built, 'run npm run build before the unit tests').toBe(true);
  });

  const publishedFiles = built ? filesUnder(distributionDirectory) : [];
  const publishedPaths = publishedFiles.map((file) => relative(distributionDirectory, file).replace(/\\/g, '/'));
  const textContents = publishedFiles
    .filter((file) => TEXT_EXTENSIONS.has(extname(file)))
    .map((file) => ({ file: relative(distributionDirectory, file), text: readFileSync(file, 'utf8') }));

  test('no denylisted name, term, pattern or secret name appears in any published file or file name', () => {
    const denylist = loadDisclosureDenylist();
    const findings = [
      ...textContents.flatMap(({ file, text }) => disclosureFindings(text, denylist).map((finding) => `${finding} in ${file}`)),
      ...publishedPaths.flatMap((path) => disclosureFindings(path, denylist).map((finding) => `${finding} in file name ${path}`)),
    ];
    expect(findings).toEqual([]);
  });

  test('no secret-shaped value appears in any published file', () => {
    const findings = textContents.flatMap(({ file, text }) => SECRET_VALUE_SHAPES.filter((pattern) => pattern.test(text)).map((pattern) => `${pattern} in ${file}`));
    expect(findings).toEqual([]);
  });

  test('no source map is published', () => {
    expect(publishedPaths.filter((path) => path.endsWith('.map'))).toEqual([]);
    expect(textContents.filter(({ text }) => text.includes('sourceMappingURL')).map(({ file }) => file)).toEqual([]);
  });

  test('no HTML comment is published', () => {
    expect(textContents.filter(({ file, text }) => file.endsWith('.html') && /<!--(?!\s*\[)/.test(text)).map(({ file }) => file)).toEqual([]);
  });

  test('every published file is one the site requests', () => {
    const htmlText = textContents.filter(({ file }) => file.endsWith('.html')).map(({ text }) => text).join('\n');
    const allowedTopLevelFiles = new Set(['bytelite-logo.png', 'bytelite-mark-64.png', 'bytelite-mark-256.png', 'og-default.jpg', 'robots.txt', 'site.webmanifest', 'sitemap-index.xml', 'sitemap-0.xml', '404.html', 'index.html']);
    const unexpectedTopLevel = publishedPaths.filter((path) => !path.includes('/') && !allowedTopLevelFiles.has(path));
    const unreferencedAssets = publishedPaths
      .filter((path) => path.startsWith('_astro/') || path.startsWith('cordel/'))
      .filter((path) => !htmlText.includes(path.split('/').pop()!) && !textContents.some(({ text }) => text.includes(path.split('/').pop()!)));
    expect(unexpectedTopLevel).toEqual([]);
    expect(unreferencedAssets).toEqual([]);
  });
});
