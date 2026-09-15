// @ts-check

const fs = require('fs');
const path = require('path');
const {createProjectDocsConfig} = require('@tu-cis-courses/docusaurus-preset/config');

const customizationPath = path.join(__dirname, 'project-docs.json');
const customization = fs.existsSync(customizationPath)
  ? JSON.parse(fs.readFileSync(customizationPath, 'utf8'))
  : {};

module.exports = createProjectDocsConfig({
  siteDir: __dirname,
  organizationName: process.env.ORG_NAME,
  projectName: process.env.PROJECT_NAME,
  tagline: 'Project documentation',
  showTemplateHelp: customization.showTemplateHelp,
  navbarItems: customization.navbarItems,
  footerColumns: customization.footerColumns,
});
