// @ts-check

const {createProjectDocsConfig} = require('@tu-cis-courses/docusaurus-preset/config');

module.exports = createProjectDocsConfig({
  siteDir: __dirname,
  organizationName: process.env.ORG_NAME,
  projectName: process.env.PROJECT_NAME,
  tagline: 'Project documentation',
});
