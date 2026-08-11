---
sidebar_position: 1
title: Adding API Specs
---

# OpenAPI Specifications

This template renders API reference pages from OpenAPI YAML files using Redocusaurus. You should edit the YAML files, not the generated reference page.

## Where the YAML Lives

OpenAPI specifications belong in:

```text
docs/api-specification/openapi/
```

The starter API specification is:

```text
docs/api-specification/openapi/index.openapi.yaml
```

## Generated Routes

Redocusaurus scans the OpenAPI folder and creates generated API reference pages.

| File | Generated page |
| --- | --- |
| `docs/api-specification/openapi/index.openapi.yaml` | `/api/` |
| `docs/api-specification/openapi/admin.openapi.yaml` | `/api/admin/` |
| `docs/api-specification/openapi/admin/index.openapi.yaml` | `/api/admin/` |

Use `index.openapi.yaml` for your main API. Add another `*.openapi.yaml` file when your project has a second API that should be documented separately.

## Editing Workflow

1. Open the relevant YAML file in `docs/api-specification/openapi/`.
2. Edit the OpenAPI `info`, `servers`, `paths`, `components`, request bodies, responses, and schemas.
3. Save the file while `yarn start` is running.
4. View the generated API reference at `/api/` or the route for the spec you edited.

Changes to existing OpenAPI files should reload during development. If you add a brand-new OpenAPI file while `yarn start` is already running, restart the dev server so Redocusaurus can discover the new file.

:::tip[learn more]
## More Documentation

This page only explains how this template wires OpenAPI into the project. For advanced Redocusaurus behavior, see the [Redocusaurus documentation](https://redocusaurus.vercel.app/docs/getting-started/Installation). For how to write an API description itself (formatting and syntax), **see the [OpenAPI documentation](https://swagger.io/specification/)**.
:::
