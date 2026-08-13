const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGE_METADATA = {
  '@docusaurus/core': {
    description: 'Easy to maintain documentation websites.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/module-type-aliases': {
    description: 'Docusaurus module type aliases.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/plugin-content-docs': {
    description: 'Docusaurus docs content plugin.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/preset-classic': {
    description: 'Classic preset for Docusaurus.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/theme-classic': {
    description: 'Classic Docusaurus theme components.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/theme-common': {
    description: 'Shared Docusaurus theme utilities.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/theme-live-codeblock': {
    description: 'Docusaurus live code block component.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/theme-mermaid': {
    description: 'Mermaid components for Docusaurus.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/types': {
    description: 'Common types for Docusaurus packages.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@docusaurus/utils': {
    description: 'Shared Docusaurus utilities.',
    repository: {url: 'https://github.com/facebook/docusaurus'},
  },
  '@mdx-js/react': {
    description: 'React context for MDX.',
    repository: {url: 'https://github.com/mdx-js/mdx'},
  },
  clsx: {
    description: 'A tiny utility for constructing className strings conditionally.',
    repository: {url: 'https://github.com/lukeed/clsx'},
  },
  'docusaurus2-dotenv-2': {
    description: 'A Docusaurus plugin that loads environment variables.',
    repository: {url: 'https://github.com/rayyone/docusaurus2-dotenv-2'},
  },
  react: {
    description: 'React is a JavaScript library for building user interfaces.',
    repository: {url: 'https://github.com/reactjs/react.dev'},
  },
  'react-dom': {
    description: 'React package for working with the DOM.',
    repository: {url: 'https://github.com/reactjs/react.dev'},
  },
  'react-zoom-pan-pinch': {
    description: 'Zoom and pan HTML elements.',
    repository: {url: 'https://github.com/BetterTyped/react-zoom-pan-pinch'},
  },
  redocusaurus: {
    description: 'Redoc for Docusaurus.',
    repository: {url: 'https://github.com/rohit-gohri/redocusaurus'},
  },
  webpack: {
    description: 'A bundler for JavaScript and assets.',
    repository: {url: 'https://github.com/webpack/webpack'},
  },
};

const COMPONENT_AUTHORS = {
  Contributors: 'Ian Applebaum',
  Figure: 'Ian Applebaum, leekd99',
  ForReview: 'Ian Applebaum',
  HomepageFeatures: 'Ian Applebaum',
  InlineDocs: 'Nicholas Rucinski',
  ReademeMD: 'Ian Applebaum',
  RevisionHistory: 'copilot-swe-agent[bot], Ian Applebaum',
  ZoomableMedia: 'Ian Applebaum',
};

function fallbackPackageInfo(packageName) {
  return PACKAGE_METADATA[packageName] ?? {
    description: 'No description available.',
    repository: {url: ''},
  };
}

async function fetchPackageInfo(packageName) {
  const fallback = fallbackPackageInfo(packageName);
  // Handle scoped packages
  const fetchName = packageName.replace('/', '%2f');
  try {
    const response = await fetch(`https://registry.npmjs.org/${fetchName}`);
    if (!response.ok) {
      if (process.env.DEPENDENCY_METADATA_DEBUG) {
        console.error(`Failed to fetch package info for ${packageName}: ${response.statusText}`);
      }
      return fallback;
    }
    const data = await response.json();
    return {
      description: data.description || fallback.description,
      repository: data.repository || fallback.repository,
    };
  } catch (error) {
    if (process.env.DEPENDENCY_METADATA_DEBUG) {
      console.error(`Using local package metadata for ${packageName}: ${error.message}`);
    }
    return fallback;
  }
}

function getRepoUrl(repo) {
  if (!repo || !repo.url) return 'N/A';
  let url = repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
  if (url.startsWith('ssh://git@')) {
    url = `https://${url.substring(10)}`;
  }
  return `[View](${url})`;
}

async function generateDependenciesPage() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  let markdownContent = `import {Contributors} from '@tu-cis-project-docs/docusaurus/components';\n\n`;
  markdownContent += `# Contributors & Open Source Usage \n\n`;
  markdownContent += `This Docusaurus runtime was designed and developed for Temple University CIS project courses. It is built on the shoulders of students, alumni, faculty, and open source software. This page is automatically generated from the package \`package.json\` file and provides a list of the projects and plugins that make this template possible.\n\n`;
  // markdownContent += `\n## Template Contributors\n\n`;
  markdownContent += `<Contributors orgName="applebaumian" projectName="tu-cis-4398-docs-template"/>\n\n`;
  markdownContent += `We welcome contributions from Temple University students, and alumni! If you'd like to contribute, please:\n\n`;
  markdownContent += `1. Fork the [template repository](https://github.com/ApplebaumIan/tu-cis-4398-docs-template)\n`;
  markdownContent += `2. Create a feature branch\n`;
  markdownContent += `3. Submit a pull request\n\n`;
  markdownContent += `All contributors will be recognized here.\n\n`;

  markdownContent += `\n## Component Authors\n\n`;
  markdownContent += `The following components were created by Temple University students and alumni. Thank you for your contributions!\n\n`;
  markdownContent += `| Component | Author(s) |\n`;
  markdownContent += `|---|---|\n`;

  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  const components = fs.readdirSync(componentsDir).filter(file => {
      const filePath = path.join(componentsDir, file);
      return fs.statSync(filePath).isDirectory();
  });

  for (const component of components) {
      const componentPath = path.join(componentsDir, component);
      try {
          const authorsOutput = execSync(`git log --pretty=format:"%an|%ae" -- "${componentPath}"`).toString().trim();
          const authorLines = [...new Set(authorsOutput.split('\n').filter(line => line))];

          const authors = await Promise.all(authorLines.reverse().map(async (line) => {
              const [name, email] = line.split('|');
              try {
                  const response = await fetch(`https://api.github.com/search/users?q=${email}+in:email`);
                  const data = await response.json();
                  if (data.items && data.items.length > 0) {
                      const user = data.items[0];
                      return `[${name}](${user.html_url})`;
                  }
              } catch (apiError) {
                  console.error(`Failed to fetch GitHub profile for ${email}: ${apiError.message}`);
              }
              return name; // Fallback to just the name
          }));

          const authorText = authors.join(', ') || COMPONENT_AUTHORS[component] || 'Not available';
          markdownContent += `| ${component} | ${authorText} |\n`;
      } catch (error) {
          console.error(`Could not find author for component ${component}: ${error.message}`);
          markdownContent += `| ${component} | ${COMPONENT_AUTHORS[component] || 'Not available'} |\n`;
      }
  }

  markdownContent += `\n## Core Dependencies\n\n`;
  markdownContent += `| Package | Description | Repository |\n`;
  markdownContent += `|---|---|---|\n`;

  for (const [name, version] of Object.entries(packageJson.dependencies)) {
    if (name === 'plugin-image-zoom') { // Special handling for git dependency
      markdownContent += `| \`${name}@${version}\` | Image zoom functionality | [View](https://github.com/flexanalytics/plugin-image-zoom) |\n`;
      continue;
    }
    const { description, repository } = await fetchPackageInfo(name);
    const repoUrl = getRepoUrl(repository);
    markdownContent += `| \`${name}@${version}\` | ${description} | ${repoUrl} |\n`;
  }

  markdownContent += `\n## Peer Dependencies\n\n`;
  markdownContent += `| Package | Description | Repository |\n`;
  markdownContent += `|---|---|---|\n`;

  for (const [name, version] of Object.entries(packageJson.peerDependencies)) {
    const { description, repository } = await fetchPackageInfo(name);
    const repoUrl = getRepoUrl(repository);
    markdownContent += `| \`${name}@${version}\` | ${description} | ${repoUrl} |\n`;
  }

  markdownContent += `\n## Development Dependencies\n\n`;
  markdownContent += `| Package | Description | Repository |\n`;
  markdownContent += `|---|---|---|\n`;

  for (const [name, version] of Object.entries(packageJson.devDependencies)) {
    const { description, repository } = await fetchPackageInfo(name);
    const repoUrl = getRepoUrl(repository);
    markdownContent += `| \`${name}@${version}\` | ${description} | ${repoUrl} |\n`;
  }

  markdownContent += `\n## License\n\n`;
  markdownContent += `This template follows the licensing of its dependencies. Please refer to individual projects for their specific licenses.\n\n`;

  const outputDir = path.join(__dirname, '..', 'tutorial');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, 'open-source-usage.mdx'), markdownContent);

    console.log('Successfully generated open-source-usage.mdx');
}

generateDependenciesPage();
