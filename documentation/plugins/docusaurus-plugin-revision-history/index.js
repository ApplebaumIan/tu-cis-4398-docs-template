const fs = require('fs/promises');
const path = require('path');

const DEFAULT_PAGE_SIZE = 5;

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

async function walkDocs(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkDocs(fullPath);
      }

      if (
        entry.isFile() &&
        /\.(md|mdx)$/i.test(entry.name) &&
        !entry.name.startsWith('_')
      ) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat();
}

async function readFrontMatterField(fullPath, fieldName) {
  const contents = await fs.readFile(fullPath, 'utf8');
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);

  if (!match) {
    return null;
  }

  const fieldMatch = match[1].match(new RegExp(`^${fieldName}:\\s*(.+)$`, 'm'));
  if (!fieldMatch) {
    return null;
  }

  return fieldMatch[1].trim().replace(/^['"]|['"]$/g, '');
}

function toRoutePath(routeBasePath, sourceRoot, fullPath) {
  const relativePath = toPosixPath(path.relative(sourceRoot, fullPath));
  const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, '');
  const withoutTrailingIndex = withoutExtension.replace(/\/index$/i, '');

  return `/${[routeBasePath, withoutTrailingIndex].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
}

function normalizeRouteCandidate(value) {
  if (!value) {
    return null;
  }

  return `/${value.replace(/^\/+|\/+$/g, '')}`.replace(/\/+/g, '/');
}

function toLookupKeys(routeBasePath, sourceRoot, fullPath, repoRoot, baseUrl, slug) {
  const routePath = toRoutePath(routeBasePath, sourceRoot, fullPath);
  const relativeToSite = toPosixPath(path.relative(sourceRoot, fullPath));
  const relativeToRepo = toPosixPath(path.relative(repoRoot, fullPath));
  const normalizedBaseUrl = baseUrl && baseUrl !== '/'
    ? `/${baseUrl.replace(/^\/+|\/+$/g, '')}`
    : '';
  const normalizedSlug = normalizeRouteCandidate(slug);
  const slugWithRouteBase = normalizedSlug
    ? normalizeRouteCandidate(`${routeBasePath}/${normalizedSlug.replace(/^\/+/, '')}`)
    : null;

  return Array.from(
    new Set([
      routePath,
      `${routePath}/`,
      normalizedSlug,
      normalizedSlug ? `${normalizedSlug}/` : null,
      slugWithRouteBase,
      slugWithRouteBase ? `${slugWithRouteBase}/` : null,
      normalizedBaseUrl ? `${normalizedBaseUrl}${routePath}` : null,
      normalizedBaseUrl ? `${normalizedBaseUrl}${routePath}/` : null,
      normalizedBaseUrl && normalizedSlug ? `${normalizedBaseUrl}${normalizedSlug}` : null,
      normalizedBaseUrl && normalizedSlug ? `${normalizedBaseUrl}${normalizedSlug}/` : null,
      normalizedBaseUrl && slugWithRouteBase ? `${normalizedBaseUrl}${slugWithRouteBase}` : null,
      normalizedBaseUrl && slugWithRouteBase ? `${normalizedBaseUrl}${slugWithRouteBase}/` : null,
      relativeToSite,
      `${routeBasePath}/${relativeToSite}`,
      relativeToRepo,
    ].filter(Boolean)),
  );
}

async function fetchJson(url, headers) {
  const response = await fetch(url, {headers});
  const data = await response.json();

  if (!response.ok) {
    const message = data && typeof data.message === 'string'
      ? data.message
      : `GitHub API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function fetchCommitHistory({orgName, projectName, repoFilePath, token}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'docusaurus-revision-history-plugin',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const commits = [];
  let page = 1;

  while (true) {
    const url = new URL(`https://api.github.com/repos/${orgName}/${projectName}/commits`);
    url.searchParams.set('path', repoFilePath);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));

    const result = await fetchJson(url, headers);
    if (!Array.isArray(result) || result.length === 0) {
      break;
    }

    commits.push(
      ...result.map((commit) => ({
        sha: commit.sha,
        commit: {
          author: {
            name: commit.commit?.author?.name ?? 'Unknown',
            date: commit.commit?.author?.date ?? null,
          },
          message: commit.commit?.message ?? '(no commit message)',
        },
      })),
    );

    if (result.length < 100) {
      break;
    }

    page += 1;
  }

  return commits;
}

module.exports = function revisionHistoryPlugin(context, options) {
  const siteDir = context.siteDir;
  const repoRoot = path.resolve(siteDir, '..');
  const orgName = process.env.ORG_NAME;
  const projectName = process.env.PROJECT_NAME;
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT;
  const baseUrl = context.siteConfig.baseUrl;
  const pageSize = Number(options.pageSize) > 0 ? Number(options.pageSize) : DEFAULT_PAGE_SIZE;
  const contentSources = options.contentSources ?? [
    {routeBasePath: 'docs', path: 'docs'},
    {routeBasePath: 'tutorial', path: 'tutorial'},
  ];

  return {
    name: 'docusaurus-plugin-revision-history',

    async loadContent() {
      if (!orgName || !projectName) {
        console.warn('[revision-history] ORG_NAME or PROJECT_NAME is missing; revision history will be empty.');
        return {histories: {}, pageSize};
      }

      if (!token) {
        console.warn('[revision-history] No GitHub token found; private repositories will not be able to fetch revision history during build.');
      }

      const histories = {};

      for (const source of contentSources) {
        const sourceRoot = path.join(siteDir, source.path);
        const files = await walkDocs(sourceRoot);

        for (const fullPath of files) {
          const repoFilePath = toPosixPath(path.relative(repoRoot, fullPath));
          const slug = await readFrontMatterField(fullPath, 'slug');

          try {
            const history = await fetchCommitHistory({
              orgName,
              projectName,
              repoFilePath,
              token,
            });

            for (const key of toLookupKeys(source.routeBasePath, sourceRoot, fullPath, repoRoot, baseUrl, slug)) {
              histories[key] = {
                history,
                error: null,
              };
            }
          } catch (error) {
            console.warn(`[revision-history] Failed to load history for ${repoFilePath}: ${error.message}`);

            for (const key of toLookupKeys(source.routeBasePath, sourceRoot, fullPath, repoRoot, baseUrl, slug)) {
              histories[key] = {
                history: [],
                error: error.message,
              };
            }
          }
        }
      }

      return {histories, pageSize};
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
