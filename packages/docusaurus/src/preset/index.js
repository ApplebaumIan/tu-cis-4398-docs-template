const path = require('path');

module.exports = function tuCisProjectDocsPreset(context, options = {}) {
  const packageRoot = path.resolve(__dirname, '..', '..');
  const tutorialPath = options.tutorialPath ?? path.join(packageRoot, 'tutorial');
  const tutorialSidebarPath = options.tutorialSidebarPath ?? path.join(packageRoot, 'tutorialSidebars.js');
  const revisionHistoryOptions = options.revisionHistory ?? {};

  return {
    plugins: [
      [
        require.resolve('../plugins/revision-history'),
        {
          cacheFile: '.cache/revision-history.json',
          pageSize: 5,
          organizationName: options.organizationName,
          projectName: options.projectName,
          contentSources: [
            {routeBasePath: 'docs', path: 'docs'},
          ],
          ...revisionHistoryOptions,
        },
      ],
      [
        require.resolve('@docusaurus/plugin-content-docs'),
        {
          id: 'tutorial',
          path: tutorialPath,
          routeBasePath: 'tutorial',
          showLastUpdateAuthor: false,
          sidebarPath: tutorialSidebarPath,
          ...options.tutorial,
        },
      ],
      [
        require.resolve('docusaurus2-dotenv-2'),
        {
          systemvars: true,
          ...options.dotenv,
        },
      ],
    ],
    themes: [
      require.resolve('@docusaurus/theme-live-codeblock'),
      require.resolve('@docusaurus/theme-mermaid'),
      [
        require.resolve('../themePlugin'),
        options.theme ?? {},
      ],
    ],
  };
};
