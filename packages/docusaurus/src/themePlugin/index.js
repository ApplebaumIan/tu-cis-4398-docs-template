const fs = require('fs');
const path = require('path');

function resolveProjectReadme(siteDir) {
  const candidates = [
    path.resolve(siteDir, '..', 'README.md'),
    path.resolve(siteDir, 'README.md'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate))
    ?? path.resolve(__dirname, '..', 'fallbacks', 'ProjectReadme.mdx');
}

function componentAliasPath(componentName) {
  return path.resolve(__dirname, '..', 'components', componentName);
}

module.exports = function tuCisProjectDocsTheme(context) {
  const componentsPath = path.resolve(__dirname, '..', 'components');

  return {
    name: '@tu-cis-project-docs/docusaurus-theme',

    getThemePath() {
      return path.resolve(__dirname, '..', 'theme');
    },

    getClientModules() {
      return [
        path.resolve(__dirname, '..', '..', 'styles', 'custom.css'),
      ];
    },

    configureWebpack() {
      return {
        resolve: {
          alias: {
            '@tu-cis-project-docs/project-readme': resolveProjectReadme(context.siteDir),
            '@site/src/components': componentsPath,
            '@site/src/components/Contributors': componentAliasPath('Contributors'),
            '@site/src/components/Figure': componentAliasPath('Figure'),
            '@site/src/components/ForReview': componentAliasPath('ForReview'),
            '@site/src/components/HomepageFeatures': componentAliasPath('HomepageFeatures'),
            '@site/src/components/InlineDocs': componentAliasPath('InlineDocs'),
            '@site/src/components/ReademeMD': componentAliasPath('ReademeMD'),
            '@site/src/components/RevisionHistory': componentAliasPath('RevisionHistory'),
            '@site/src/components/ZoomableMedia': componentAliasPath('ZoomableMedia'),
          },
        },
      };
    },
  };
};
