const fs = require('fs');
const path = require('path');

const DEFAULT_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Temple_T_logo.svg';
const DEFAULT_PROJECT_NAME = 'docs-dev-mode';
const PACKAGE_CUSTOM_CSS = path.resolve(__dirname, '..', '..', 'styles', 'custom.css');

function toTitle(value) {
  return value
    .replaceAll('-', ' ')
    .split(' ')
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.substring(1) : ''))
    .join(' ');
}

function normalizeBaseUrl(value) {
  const normalized = String(value || DEFAULT_PROJECT_NAME).replace(/^\/+|\/+$/g, '');
  return `/${normalized}/`;
}

function jiraIssueCollectorScripts(organizationName) {
  if (organizationName !== 'ApplebaumIan') {
    return [];
  }

  return [
    'https://temple-cis-projects-in-cs.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/azc3hx/b/8/c95134bc67d3a521bb3f4331beb9b804/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=50af7ec2',
    'https://temple-cis-projects-in-cs.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/azc3hx/b/8/c95134bc67d3a521bb3f4331beb9b804/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=160e88a6',
  ];
}

function mergeThemeConfig(baseThemeConfig, overrideThemeConfig = {}) {
  return {
    ...baseThemeConfig,
    ...overrideThemeConfig,
    navbar: {
      ...baseThemeConfig.navbar,
      ...overrideThemeConfig.navbar,
      items: overrideThemeConfig.navbar?.items ?? baseThemeConfig.navbar.items,
    },
    footer: {
      ...baseThemeConfig.footer,
      ...overrideThemeConfig.footer,
      links: overrideThemeConfig.footer?.links ?? baseThemeConfig.footer.links,
    },
  };
}

function toArray(value) {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function resolveCustomCss(siteDir, customCss) {
  if (customCss === false) {
    return [PACKAGE_CUSTOM_CSS];
  }

  if (customCss) {
    return [
      PACKAGE_CUSTOM_CSS,
      ...toArray(customCss),
    ];
  }

  const defaultLocalCss = path.join(siteDir, 'src', 'css', 'custom.css');
  return [
    PACKAGE_CUSTOM_CSS,
    ...(fs.existsSync(defaultLocalCss) ? [defaultLocalCss] : []),
  ];
}

function mergeClassicThemeOptions(baseThemeOptions, overrideThemeOptions = {}) {
  const {customCss: overrideCustomCss, ...overrideRest} = overrideThemeOptions;

  return {
    ...baseThemeOptions,
    ...overrideRest,
    customCss: [
      ...toArray(baseThemeOptions.customCss),
      ...toArray(overrideCustomCss),
    ],
  };
}

function createTuCisProjectDocsConfig(options = {}) {
  const siteDir = options.siteDir ?? process.cwd();
  const organizationName = options.organizationName ?? process.env.ORG_NAME;
  const projectName = options.projectName ?? process.env.PROJECT_NAME ?? DEFAULT_PROJECT_NAME;
  const title = options.title ?? toTitle(projectName);
  const logo = options.logo ?? DEFAULT_LOGO;
  const repositoryUrl = organizationName && projectName
    ? `https://github.com/${organizationName}/${projectName}`
    : undefined;
  const customCss = resolveCustomCss(siteDir, options.customCss);
  const classicThemeOptions = {customCss};
  const {theme: classicThemeOverride, ...classicOverrides} = options.classic ?? {};
  const future = {
    ...options.future,
    experimental_faster: {
      mdxCrossCompilerCache: false,
      ...options.future?.experimental_faster,
    },
  };
  const baseThemeConfig = {
    ...(process.env.NODE_ENV === 'development'
      ? {
          announcementBar: {
            id: 'dev_mode',
            content: 'You are currently working on a local development version of your docs. This is <b>NOT</b> the live site.',
            backgroundColor: '#ffca00',
            textColor: '#091E42',
            isCloseable: false,
          },
        }
      : {}),
    navbar: {
      title,
      logo: {
        alt: 'Project logo',
        src: logo,
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          to: '/tutorial/intro',
          label: 'Docusaurus Tutorial',
          position: 'left',
          activeBaseRegex: '/tutorial/',
        },
        ...(repositoryUrl
          ? [
              {
                href: repositoryUrl,
                label: 'GitHub',
                position: 'right',
              },
            ]
          : []),
      ],
    },
    footer: {
      logo: {
        alt: 'Project logo',
        src: logo,
      },
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            ...(repositoryUrl
              ? [
                  {
                    label: 'GitHub',
                    href: repositoryUrl,
                  },
                ]
              : []),
            {
              label: 'Template Contributors',
              to: '/tutorial/open-source-usage',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ${title}, Inc. Built with Docusaurus.`,
    },
  };

  return {
    title,
    tagline: options.tagline ?? 'Owls are cool',
    url: options.url ?? (organizationName ? `https://${organizationName}.github.io/` : 'https://example.com/'),
    baseUrl: options.baseUrl ?? normalizeBaseUrl(projectName),
    trailingSlash: false,
    onBrokenLinks: options.onBrokenLinks ?? 'warn',
    onBrokenMarkdownLinks: options.onBrokenMarkdownLinks ?? 'warn',
    favicon: options.favicon ?? 'img/favicon.ico',
    future,
    organizationName,
    projectName,
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
      ...options.i18n,
    },
    markdown: {
      mermaid: true,
      ...options.markdown,
    },
    presets: [
      [
        require.resolve('@docusaurus/preset-classic'),
        {
          docs: {
            showLastUpdateAuthor: true,
            sidebarPath: options.sidebarPath ?? path.join(siteDir, 'sidebars.js'),
            routeBasePath: 'docs',
            path: 'docs',
            editUrl: options.editUrl ?? (repositoryUrl ? `${repositoryUrl}/edit/main/documentation/` : undefined),
            ...options.docs,
          },
          ...classicOverrides,
          theme: mergeClassicThemeOptions(classicThemeOptions, classicThemeOverride),
        },
      ],
      [
        require.resolve('redocusaurus'),
        {
          specs: [
            {
              id: 'openapi-main',
              spec: 'docs/api-specification/openapi/index.openapi.yaml',
              route: '/api/',
            },
            ...(options.openapi?.specs ?? []),
          ],
          openapi: {
            path: 'docs/api-specification/openapi',
            routeBasePath: '/api',
            ...(options.openapi?.openapi ?? {}),
          },
          ...options.redocusaurus,
        },
      ],
      [
        require.resolve('../preset'),
        {
          organizationName,
          projectName,
          ...options.preset,
          theme: {
            loadStyles: false,
            ...options.preset?.theme,
          },
        },
      ],
      ...(options.presets ?? []),
    ],
    themeConfig: mergeThemeConfig(baseThemeConfig, options.themeConfig),
    plugins: options.plugins ?? [],
    scripts: options.scripts ?? [
      'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
      ...jiraIssueCollectorScripts(organizationName),
    ],
  };
}

module.exports = {
  createTuCisProjectDocsConfig,
  toTitle,
  normalizeBaseUrl,
};
