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

function parseVersion(version) {
  return String(version ?? '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isVersionAtLeast(version, minimum) {
  const currentParts = parseVersion(version);
  const minimumParts = parseVersion(minimum);
  const length = Math.max(currentParts.length, minimumParts.length);

  for (let index = 0; index < length; index += 1) {
    const current = currentParts[index] ?? 0;
    const target = minimumParts[index] ?? 0;

    if (current > target) return true;
    if (current < target) return false;
  }

  return true;
}

function isWebpackBarPlugin(plugin) {
  return plugin?.constructor?.name === 'WebpackBarPlugin';
}

function filterIncompatibleProgressPlugins(config, configureWebpackUtils) {
  const webpackVersion = configureWebpackUtils?.currentBundler?.instance?.version;
  const shouldFilterWebpackBar =
    configureWebpackUtils?.currentBundler?.name === 'webpack'
    && isVersionAtLeast(webpackVersion, '5.109.0');

  if (!shouldFilterWebpackBar || !Array.isArray(config.plugins)) {
    return null;
  }

  const plugins = config.plugins.filter((plugin) => !isWebpackBarPlugin(plugin));
  return plugins.length === config.plugins.length ? null : plugins;
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

    configureWebpack(config, isServer, configureWebpackUtils) {
      const plugins = filterIncompatibleProgressPlugins(config, configureWebpackUtils);
      const webpackConfig = {
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

      if (plugins) {
        webpackConfig.mergeStrategy = {
          plugins: 'replace',
        };
        webpackConfig.plugins = plugins;
      }

      return webpackConfig;
    },
  };
};
