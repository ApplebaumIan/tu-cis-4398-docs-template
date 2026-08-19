# create-project-docs

CLI for scaffolding and diagnosing Temple University CIS project documentation sites.

```bash
npx create-project-docs new my-project
npx create-project-docs add --path ../existing-project
npx create-project-docs doctor --path ../existing-project
```

The generated documentation site depends on `@tu-cis-project-docs/docusaurus` for reusable runtime behavior. The CLI itself intentionally has no runtime dependency on Docusaurus so it can be installed and tested before the runtime package is published.

## Local Template Testing

Use `CREATE_PROJECT_DOCS_TEMPLATE_PATH` to scaffold from a local checkout instead of cloning GitHub:

```bash
CREATE_PROJECT_DOCS_TEMPLATE_PATH=/path/to/tu-cis-4398-docs-template \
  npx create-project-docs new my-project --skip-install
```
