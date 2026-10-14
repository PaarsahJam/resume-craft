import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guardrail tests for the Vercel deployment surface.
 *
 * These assert properties of the built/bundled output and of the shipped demo
 * data — the two things a deployment can silently get wrong without any
 * functional test failing.
 */

const ROOT = process.cwd();
const API_DIR = join(ROOT, 'api');
const DIST = join(ROOT, 'dist');

describe('demo data ships no real personal information', () => {
  /**
   * Leakage detection by PATTERN, not by literal identifiers.
   *
   * An earlier version hard-coded the repository owner's real name and account
   * fragments so it could assert they were absent — which meant committing
   * personal identifiers in order to prove they were absent. These assertions
   * instead detect *realistic* identifiers by shape (an email at a non-reserved
   * domain, an international phone number, a personal social profile URL) and
   * match them against a short allowlist of known fictional demo personas.
   *
   * Precisely what this covers: a realistic-looking contact identifier
   * appearing in the shipped demo data, in application source, or in the built
   * client bundle.
   *
   * Precisely what it does NOT cover, stated plainly:
   * - Real identifiers that happen to resemble an allowlisted demo persona.
   * - Identifiers with no recognisable shape (a bare personal name, a company
   *   name, a postal address).
   * - Anything not shaped like an email, phone number, or social profile URL.
   *
   * The sentinel test below proves the detector is live, but no pattern-based
   * check can prove the absence of every possible real-world identifier.
   */

  /** Domains reserved for documentation use (RFC 2606 / RFC 6761). */
  const RESERVED_EMAIL_DOMAINS = [
    'example.com',
    'example.net',
    'example.org',
    'example.am',
    'example.edu',
    'example.co.uk',
  ];

  /**
   * Fictional demo personas already present in src/data/sampleResume.ts.
   * Listing them keeps the guard strict for everything else: any identifier
   * not on this list fails the test.
   */
  const DEMO_IDENTIFIER_ALLOWLIST = new Set([
    'alex.morgan@example.com',
    'armen.grigoryan@example.am',
    'lara.muller@email.com',
  ]);

  /** '+1 555 …' is the reserved fictional exchange used by the demo data. */
  const FICTIONAL_PHONE_RE = /\+1[\s(]*555[\s)-]*\d/;
  const DEMO_PHONE_ALLOWLIST = new Set(['+374 91 12 34 56', '+49 30 6824 5179']);

  const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  // Requires a human separator, which excludes bare numeric constants such as
  // `+4294967296` that appear throughout bundled libraries.
  const PHONE_RE = /\+\d[\d ()-]{7,}\d/g;
  const PHONE_SHAPE_RE = /^[+\d][\d ()-]*[\s()-][\d ()-]*\d$/;
  // LinkedIn personal profiles are the unambiguous social signal.
  //
  // GitHub handles are deliberately NOT matched: they appear pervasively in
  // bundled dependency attribution (including licences of libraries that are
  // not themselves installed) and in legitimate demo data, which makes them too
  // noisy to act on. A GitHub-only leak is therefore a documented blind spot.
  const LINKEDIN_RE = /linkedin\.com\/in\/[A-Za-z0-9._%-]+/gi;

  /** Fictional profile handles used by the demo data and editor placeholders. */
  const DEMO_PROFILE_ALLOWLIST = new Set([
    'linkedin.com/in/alexmorgan-demo',
    'linkedin.com/in/armengrigoryan',
    'linkedin.com/in/lara-mueller',
    'linkedin.com/in/janedoe',
  ]);

  /**
   * Identifiers that originate from an installed dependency rather than from
   * application code.
   *
   * The built bundle legitimately contains library authors, maintainer emails
   * and repository URLs. Indexing dependency package metadata lets the guard
   * attribute a finding to its dependency instead of failing on it, so any
   * identifier NOT traceable to a dependency and not an allowlisted demo
   * persona is treated as application-introduced personal data.
   */
  let dependencyIndex: string | undefined;
  function getDependencyIndex(): string {
    if (dependencyIndex !== undefined) return dependencyIndex;
    const chunks: string[] = [];
    const nodes = join(ROOT, 'node_modules');
    if (existsSync(nodes)) {
      for (const entry of readdirSync(nodes, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === '.bin') continue;
        if (entry.name.startsWith('@')) {
          for (const scoped of readdirSync(join(nodes, entry.name), { withFileTypes: true })) {
            if (!scoped.isDirectory()) continue;
            collectPackageMetadata(join(nodes, entry.name, scoped.name), chunks);
          }
          continue;
        }
        collectPackageMetadata(join(nodes, entry.name), chunks);
      }
    }
    dependencyIndex = chunks.join('\n').toLowerCase();
    return dependencyIndex;
  }

  function collectPackageMetadata(pkgDir: string, chunks: string[]): void {
    for (const file of ['package.json', 'README.md', 'LICENSE', 'LICENSE.md', 'NOTICE']) {
      const full = join(pkgDir, file);
      if (!existsSync(full)) continue;
      try {
        chunks.push(readFileSync(full, 'utf8'));
      } catch {
        // Unreadable metadata is simply not indexed.
      }
    }

    // Author/maintainer details are also embedded in a package's built entry
    // point (e.g. a banner comment in a bundled library), so follow the
    // declared entry fields as well.
    const manifestPath = join(pkgDir, 'package.json');
    if (!existsSync(manifestPath)) return;
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const entries: string[] = [];
      for (const key of ['main', 'module', 'browser', 'unpkg', 'jsdelivr']) {
        if (typeof manifest[key] === 'string') entries.push(manifest[key]);
      }
      for (const entry of entries) {
        const full = join(pkgDir, entry);
        if (!existsSync(full)) continue;
        const text = readFileSync(full, 'utf8');
        // Bound the read so a very large bundle cannot slow the suite.
        if (text.length <= 4_000_000) chunks.push(text);
      }
    } catch {
      // Malformed manifest: skip the entry-point probe.
    }
  }

  /**
   * Chunks that belong to the application rather than to vendored libraries.
   *
   * Read from `dist/index.html`: the entry `<script>` plus any asset it
   * references. Rollup emits separate chunks for large dependencies (jsPDF,
   * html2canvas, DOMPurify), and those legitimately embed library authors'
   * banner comments. Restricting the scan to application-authored assets keeps
   * the guard focused on data this project actually ships.
   */
  function applicationAssetPaths(): string[] {
    const indexHtml = join(DIST, 'index.html');
    if (!existsSync(indexHtml)) return [];
    const html = readFileSync(indexHtml, 'utf8');
    const refs = new Set<string>();
    for (const match of html.match(/(?:src|href)="\/assets\/([^"]+\.(?:js|css))"/g) ?? []) {
      refs.add(match.replace(/^(?:src|href)="/, '').replace(/"$/, ''));
    }
    return [...refs]
      .map((rel) => join(DIST, rel))
      .filter((full) => existsSync(full));
  }

  /** Returns identifiers that look like real personal contact details. */
  function findRealisticIdentifiers(
    text: string,
    options: { ignoreDependencies?: boolean } = {}
  ): string[] {
    const findings: string[] = [];

    for (const match of text.match(EMAIL_RE) ?? []) {
      const address = match.toLowerCase();
      const isReserved = RESERVED_EMAIL_DOMAINS.some((d) => address.endsWith(`@${d}`));
      if (isReserved || DEMO_IDENTIFIER_ALLOWLIST.has(address)) continue;
      if (options.ignoreDependencies && getDependencyIndex().includes(address)) continue;
      findings.push(`email:${address}`);
    }

    for (const match of text.match(PHONE_RE) ?? []) {
      const phone = match.trim();
      if (!PHONE_SHAPE_RE.test(phone)) continue;
      if (FICTIONAL_PHONE_RE.test(phone) || DEMO_PHONE_ALLOWLIST.has(phone)) continue;
      if (options.ignoreDependencies && getDependencyIndex().includes(phone.toLowerCase())) continue;
      findings.push(`phone:${phone}`);
    }

    for (const match of text.match(LINKEDIN_RE) ?? []) {
      const profile = match.toLowerCase();
      if (DEMO_PROFILE_ALLOWLIST.has(profile)) continue;
      if (options.ignoreDependencies && getDependencyIndex().includes(profile)) continue;
      findings.push(`social:${profile}`);
    }

    return findings;
  }

  function walk(dir: string, matchFile: RegExp): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walk(full, matchFile));
        continue;
      }
      if (matchFile.test(entry.name)) files.push(full);
    }
    return files;
  }

  /**
   * Proves the detector is live. If this fails, every assertion below would be
   * vacuous — so it is asserted first and in isolation.
   */
  it('detector flags a synthetic sensitive fixture', () => {
    // Deterministic and obviously fabricated. `.invalid` is reserved by
    // RFC 2606 and can never resolve, so it cannot be a real address.
    const sentinel = [
      'contact: Synthetic.User@synthetic-domain.invalid',
      'tel: +44 20 7946 0958',
      'profile: linkedin.com/in/synthetic-detector-sentinel',
    ].join('\n');

    const findings = findRealisticIdentifiers(sentinel);
    expect(findings.length).toBeGreaterThanOrEqual(3);
    expect(findings.some((f) => f.startsWith('email:'))).toBe(true);
    expect(findings.some((f) => f.startsWith('phone:'))).toBe(true);
    expect(findings.some((f) => f.startsWith('social:'))).toBe(true);
  });

  it('detector does not flag reserved documentation identifiers', () => {
    const safe = [
      'alex.morgan@example.com',
      'person@example.org',
      'someone@example.net',
      'someone@example.am',
      'tel: +1 555 0100',
      'profile: github.com/example',
    ].join('\n');

    expect(findRealisticIdentifiers(safe)).toEqual([]);
  });

  it('the detector reports a failure when a synthetic sensitive fixture is introduced', () => {
    const injected = 'resume owner: Synthetic.User@synthetic-domain.invalid';
    expect(findRealisticIdentifiers(injected)).not.toEqual([]);
  });

  it('src/data/sampleResume.ts ships no realistic identifiers', () => {
    const source = readFileSync(join(ROOT, 'src/data/sampleResume.ts'), 'utf8');
    expect(findRealisticIdentifiers(source)).toEqual([]);
  });

  it('no application source file under src/ ships realistic identifiers', () => {
    const offenders: Record<string, string[]> = {};
    for (const file of walk(join(ROOT, 'src'), /\.tsx?$/)) {
      // Test files legitimately contain synthetic fixtures and patterns.
      if (/\.test\.tsx?$/.test(file)) continue;
      const findings = findRealisticIdentifiers(readFileSync(file, 'utf8'));
      if (findings.length > 0) offenders[file.replace(ROOT, '.')] = findings;
    }
    expect(offenders).toEqual({});
  });

  it('the built client bundle ships no realistic identifiers', () => {
    if (!existsSync(DIST)) {
      // `npm test` may run before `npm run build` in CI. The source-level
      // assertions above still cover the regression; skip rather than fail.
      return;
    }
    // index.html itself is always application-authored.
    const targets = [join(DIST, 'index.html'), ...applicationAssetPaths()];
    const offenders: Record<string, string[]> = {};
    for (const file of targets) {
      if (!existsSync(file)) continue;
      const findings = findRealisticIdentifiers(readFileSync(file, 'utf8'), {
        ignoreDependencies: true,
      });
      if (findings.length > 0) offenders[file.replace(ROOT, '.')] = findings;
    }
    expect(offenders).toEqual({});
  });

  it('the demo resume still uses obviously synthetic contact details', () => {
    const source = readFileSync(join(ROOT, 'src/data/sampleResume.ts'), 'utf8');
    // example.com is reserved for documentation use.
    expect(source).toContain('alex.morgan@example.com');
  });

  it('keeps the sample-resume feature intact', () => {
    const source = readFileSync(join(ROOT, 'src/data/sampleResume.ts'), 'utf8');
    expect(source).toContain('export const sampleResume: Resume');
    expect(source).toContain('sampleResumeMarkdown');
    // The id is referenced by the store's restore path.
    expect(source).toContain("id: 'demo-sample-resume'");
  });
});

describe('production server bundle has no unconditional Vite dependency', () => {
  const BUNDLE = join(ROOT, 'build', 'server.cjs');

  it('does not require vite at module scope', () => {
    if (!existsSync(BUNDLE)) return; // built later in CI; source check below
    const bundle = readFileSync(BUNDLE, 'utf8');
    expect(bundle).not.toMatch(/^var\s+\w+\s*=\s*require\(["']vite["']\)/m);
  });

  it('loads vite only through a dynamic import', () => {
    if (!existsSync(BUNDLE)) return;
    const bundle = readFileSync(BUNDLE, 'utf8');
    expect(bundle).toContain('import("vite")');
  });

  /**
   * `dist/` is the static output Vercel serves as-is. If the server bundle
   * were written there it would be publicly downloadable at /server.cjs.
   */
  it('keeps the server bundle out of the static output directory', () => {
    if (!existsSync(DIST)) return;
    expect(existsSync(join(DIST, 'server.cjs'))).toBe(false);
    expect(existsSync(join(DIST, 'server.cjs.map'))).toBe(false);
  });

  it('server.ts imports vite dynamically, not at the top level', () => {
    const source = readFileSync(join(ROOT, 'server.ts'), 'utf8');
    expect(source).not.toMatch(/^import .*from 'vite';/m);
    expect(source).toContain("await import('vite')");
  });

  it('still serves the built client in production', () => {
    const source = readFileSync(join(ROOT, 'server.ts'), 'utf8');
    expect(source).toContain('express.static(distPath)');
  });
});

describe('Vercel function surface', () => {
  it('exports a handler for the health check', () => {
    expect(existsSync(join(API_DIR, 'health.ts'))).toBe(true);
  });

  const AI_ROUTES = [
    'improve-summary',
    'improve-bullet',
    'tailor-jd',
    'generate-cover-letter',
    'translate-resume',
  ];

  it.each(AI_ROUTES)('exports a handler for /api/ai/%s', (route) => {
    const file = join(API_DIR, 'ai', `${route}.ts`);
    expect(existsSync(file), `missing ${file}`).toBe(true);
    const source = readFileSync(file, 'utf8');
    expect(source).toContain('export default');
    expect(source).toContain('createAiHandler');
  });

  it('each handler is a thin shell, not a reimplementation', () => {
    for (const route of AI_ROUTES) {
      const source = readFileSync(join(API_DIR, 'ai', `${route}.ts`), 'utf8');
      // No duplicated business logic: no validation, prompts, or fetch.
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('validate');
      expect(source).not.toContain('messages:');
    }
  });

  it('no API function imports the Vite dev server', () => {
    for (const route of AI_ROUTES) {
      const source = readFileSync(join(API_DIR, 'ai', `${route}.ts`), 'utf8');
      expect(source).not.toContain("from 'vite'");
    }
    expect(readFileSync(join(API_DIR, 'health.ts'), 'utf8')).not.toContain("from 'vite'");
  });

  it('declares vercel.json pinned to npm with a vite build', () => {
    const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
    expect(config.framework).toBe('vite');
    expect(config.installCommand).toBe('npm ci');
    expect(config.outputDirectory).toBe('dist');
  });

  it('pins the package manager to npm in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.packageManager).toMatch(/^npm@/);
    expect(pkg.engines?.node).toBeDefined();
  });
});

describe('rate-limiter limitation is documented', () => {
  it('the adapter states that in-process limiting is not distributed', () => {
    const source = readFileSync(join(ROOT, 'src/server/vercelAdapter.ts'), 'utf8');
    // Normalise block-comment formatting (`*` prefixes, line wrapping) so the
    // assertion tests the wording, not the layout.
    const prose = source
      .replace(/^\s*\/\*+/gm, ' ')
      .replace(/^\s*\*\/?/gm, ' ')
      .replace(/\s+/g, ' ');
    expect(prose).toMatch(/NOT a global or distributed control/i);
    expect(prose).toMatch(/separate public-launch requirement/i);
  });

  it('the underlying limiter still documents its process-local state', () => {
    const source = readFileSync(join(ROOT, 'src/server/rateLimiter.ts'), 'utf8');
    expect(source).toMatch(/process-local/i);
  });
});