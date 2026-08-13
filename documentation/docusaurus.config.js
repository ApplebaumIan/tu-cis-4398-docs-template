// @ts-check

const {createTuCisProjectDocsConfig} = require('@tu-cis-project-docs/docusaurus/config');

/**
 * The URL or reference to your project's logo.
 * @type {string}
 */
const logo = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Temple_T_logo.svg';

/** @type {import('@docusaurus/types').Config} */
const config = createTuCisProjectDocsConfig({
  siteDir: __dirname,
  organizationName: process.env.ORG_NAME,
  projectName: process.env.PROJECT_NAME,
  tagline: 'Owls are cool',
  logo,
});

module.exports = config;
