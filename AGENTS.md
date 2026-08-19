# AGENTS.md

## Purpose

This repository is the reusable Docusaurus documentation template for Temple University CIS 4398 capstone projects.

Treat the template itself as a software product. Changes made here may eventually affect many student repositories.

Optimize for:

1. student usability;
2. quality and clarity of the resulting technical documentation;
3. low repetitive effort for student teams;
4. backwards compatibility;
5. maintainability across semesters;
6. accessibility;
7. GitHub Pages reliability;
8. consistency across projects;
9. extensibility;
10. visual polish.

Do not treat this as a generic Docusaurus site.

The best solution is usually the one that keeps student-facing authoring simple while centralizing justified complexity inside reusable template infrastructure.

---

## Repository Map

The student-facing Docusaurus application lives under:

```text
documentation/
```

Important areas:

```text
documentation/
├── docs/                 # student project documentation scaffold
├── scripts/              # generation/build utilities
├── src/
│   ├── css/              # optional project/local CSS overrides
│   ├── pages/            # application-level pages, including homepage
├── static/               # static assets and OpenAPI files
├── docusaurus.config.js
├── package.json
└── sidebars.js
```

Reusable runtime and scaffolding behavior lives under:

```text
packages/
├── docusaurus/           # reusable Docusaurus runtime package
│   ├── src/components/   # student-facing MDX/React component APIs
│   ├── src/theme/        # Docusaurus theme overrides/swizzles
│   ├── src/plugins/      # reusable Docusaurus plugins
│   ├── styles/           # shared default CSS
│   └── tutorial/         # help/documentation for using this template
└── create-project-docs/  # scaffold, doctor, and future migration CLI
```

The repository root also contains GitHub Actions, workspace configuration, and development-container configuration.

Before proposing a significant change, inspect the current implementation. Do not assume stock Docusaurus behavior.

---

## Technical Foundation

The template currently uses Docusaurus 3, React 18, MDX, Yarn 1, Mermaid, live code blocks, Redocusaurus/OpenAPI, remote content, environment-driven configuration, custom theme overrides, and a custom revision-history plugin.

Prefer existing capabilities before adding new dependencies or abstractions.

---

## Keep `docs/` and `tutorial/` Distinct

There are two separate documentation experiences.

### `documentation/docs/`

Student-authored documentation about the capstone project.

Examples include:

- requirements;
- system architecture;
- testing;
- API specifications;
- project overview.

### `packages/docusaurus/tutorial/`

Help content explaining how to use Docusaurus and the custom functionality provided by this template.

Before adding documentation, determine whether it belongs to the student's project or to the template tutorial.

Do not mix these responsibilities without a clear reason.

---

## Environment-Driven Reuse

This template is consumed by different GitHub repositories.

Important configuration is derived from:

```text
ORG_NAME
PROJECT_NAME
```

These values affect project identity, GitHub URLs, edit links, and GitHub Pages routing.

Do not hard-code a student repository name, GitHub organization, or production URL into reusable behavior.

---

## GitHub Pages Is a First-Class Constraint

Generated sites may be hosted beneath:

```text
/<PROJECT_NAME>/
```

Do not assume `/` is the deployed site root.

When adding routes, links, images, or assets:

- respect Docusaurus `baseUrl`;
- prefer Docusaurus routing/URL helpers;
- avoid brittle root-relative paths;
- consider local development and production behavior;
- verify static-hosting behavior when routing changes.

A feature that works locally but breaks under a GitHub Pages repository subpath is not complete.

---

## Choose the Correct Ownership Layer

Put behavior in the lowest-complexity layer that correctly owns it.

Use this progression:

1. **Student content** — `docs/`
2. **Template help content** — `tutorial/`
3. **Plain Markdown**
4. **Mermaid**
5. **Reusable MDX/React component** — `packages/docusaurus/src/components/`
6. **Shared presentation/CSS** — `packages/docusaurus/styles/`; project overrides in `documentation/src/css/`
7. **Application-level page** — `src/pages/`
8. **Supported Docusaurus configuration** — `docusaurus.config.js`
9. **Theme override/swizzle** — `packages/docusaurus/src/theme/`
10. **Build-time/plugin behavior** — `packages/docusaurus/src/plugins/` or `documentation/scripts/`
11. **Installation behavior** — `packages/create-project-docs/`
12. **Deployment/CI behavior** — `.github/workflows/`

Do not solve a content problem with a theme override or a CSS problem with a plugin.

---

## Prefer Markdown Before React

Do not turn ordinary documentation into React unnecessarily.

Before adding a component, ask:

1. Can plain Markdown express this clearly?
2. Does Docusaurus already provide it?
3. Can Mermaid solve it?
4. Does the behavior need to be reused?
5. Does centralizing it materially reduce student effort?

Use React when it adds meaningful reusable behavior, not merely custom styling.

---

## Components Are a Student-Facing API

`packages/docusaurus/src/components/` is effectively a component library for student authors.

Existing component areas include:

- `Contributors`;
- `Figure`;
- `ForReview`;
- `HomepageFeatures`;
- `InlineDocs`;
- `ReademeMD`;
- `RevisionHistory`;
- `ZoomableMedia`.

Before changing an existing component:

1. search for all usages;
2. inspect related tutorial content;
3. identify student-authored MDX that may depend on it;
4. preserve existing props and behavior when practical.

For new components:

- keep the API small;
- provide sensible defaults;
- hide implementation details;
- make invalid states difficult;
- support responsive layouts;
- support accessibility;
- document student-facing usage in `tutorial/`.

If students need a long React explanation to use a component, simplify its API.

---

## Theme Overrides Are High-Cost

The repository already overrides Docusaurus behavior under `packages/docusaurus/src/theme/`.

Theme overrides increase upgrade risk because they depend on Docusaurus internals.

Before adding or expanding a theme override:

1. check supported Docusaurus configuration;
2. check whether CSS is sufficient;
3. check whether a reusable component is sufficient;
4. use a theme override only if those approaches are inadequate.

When modifying an existing override, preserve upstream contracts where possible.

Do not swizzle merely to achieve a minor styling change.

---

## Dependencies Have Template-Wide Cost

Before adding a package:

1. check existing dependencies;
2. check native Docusaurus features;
3. check React/browser APIs;
4. consider a small local implementation.

If a new dependency is justified, explain:

- the capability it provides;
- why existing tools are insufficient;
- whether students interact with it;
- maintenance implications;
- bundle/runtime implications when relevant.

Do not introduce a large UI framework for a small presentation problem.

---

## Repository-Derived Data

Prefer deriving trustworthy metadata from authoritative repository sources instead of asking students to maintain duplicate information.

Potential sources include:

- Git history;
- GitHub metadata;
- document metadata;
- repository structure;
- OpenAPI specifications.

The existing revision-history functionality is an example of this approach.

Automation is valuable when it removes repetitive work without hiding concepts students should understand.

Do not automate merely because it is possible.

---

## OpenAPI

OpenAPI is a first-class capability.

Keep these concerns distinct:

1. machine-readable OpenAPI specification;
2. generated API reference UI;
3. architectural documentation explaining how the API fits into the system.

Prefer generated endpoint reference material over manually duplicated endpoint tables.

Generated API reference documentation does not replace authentication guidance, examples, architecture, or design rationale.

---

## Mermaid and Technical Diagrams

Prefer Mermaid for maintainable, source-controlled diagrams when it communicates the information well.

Typical uses include:

- architecture diagrams;
- sequence diagrams;
- class diagrams;
- state diagrams;
- flowcharts;
- entity relationships.

Do not force Mermaid when another representation is substantially clearer.

Large technical diagrams must remain usable on desktop and mobile.

---

## Images and Media

The template contains custom figure/image/zoom behavior.

When changing media presentation, account for:

- architecture diagrams;
- screenshots;
- captions;
- alt text;
- keyboard interaction;
- responsive sizing;
- mobile usability;
- light/dark themes;
- zoom and pan behavior.

Do not optimize only for decorative images at the expense of technical diagrams.

---

## Homepage

The homepage is the public entry point to a student's project, not an administrative dashboard.

It should help a reader quickly understand:

- what the project is;
- what it does;
- who built it;
- where the technical documentation is;
- where the source repository is.

Prefer a clear project narrative over dashboard-style information density.

Do not add widgets simply because data is available.

---

## Student Complexity vs. Maintainer Complexity

For every significant feature, ask:

> Where does the complexity live?

Moderately sophisticated internals are acceptable when they are well encapsulated and substantially simplify the student experience.

Good examples:

- complex logic behind a simple MDX API;
- generated repository data;
- centralized compatibility handling;
- reusable behavior documented once.

Avoid:

- configuration every team must understand;
- fragile repeated setup steps;
- components exposing Docusaurus internals;
- features requiring students to edit multiple unrelated files.

Prefer moving justified complexity into reusable template infrastructure.

---

## Visual Design

The result should feel like a professional software-engineering documentation site, not an untouched Docusaurus starter.

Prefer:

- clear information hierarchy;
- restrained visual language;
- readable typography;
- useful whitespace;
- strong technical-diagram presentation;
- consistent reusable components;
- responsive layouts;
- accessible interactions.

Avoid:

- card grids everywhere;
- gratuitous gradients;
- unnecessary animation;
- dashboard-style density;
- decorative UI with little informational value;
- one-off designs that weaken consistency.

Documentation content should remain the visual focus.

---

## Accessibility

Accessibility is a requirement.

For UI changes, consider:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- appropriate ARIA usage;
- contrast;
- text scaling;
- screen readers;
- mobile layouts;
- reduced-motion expectations;
- meaningful alt text.

Do not create interactions that require hover.

Prefer native semantic elements over recreating them with generic elements.

---

## Backwards Compatibility

Changes to this template can affect downstream student repositories.

Treat changes to the following as potentially breaking:

- component props;
- MDX behavior;
- routes;
- configuration;
- plugins;
- generated content;
- CLI behavior;
- deployment workflows.

Prefer additive or backwards-compatible changes.

If a breaking change is necessary, identify:

1. what breaks;
2. why the change is justified;
3. how an existing project migrates.

Do not silently change student-facing APIs.

---

## Repository-Native Documentation

Prefer documentation and metadata that live with the code and participate in the normal engineering workflow.

Favor approaches that are:

- version controlled;
- reviewable in pull requests;
- connected to Git history;
- maintainable in Markdown/MDX;
- generated from authoritative repository data when appropriate.

Avoid asking students to maintain the same technical information in multiple systems.

---

## Change Scope

Follow the style of the surrounding code.

Do not perform broad refactors while implementing an unrelated feature.

When editing existing behavior:

1. understand why it exists;
2. identify its consumers;
3. make the smallest coherent change;
4. preserve public behavior unless the task requires changing it;
5. update tutorial content when student-facing behavior changes.

Distinguish between:

- a bug;
- a maintainability problem;
- an architectural limitation;
- a style preference.

Do not present style preferences as architectural requirements.

---

## Agent Workflow

For non-trivial tasks, follow this workflow.

### 1. Inspect

Read the relevant implementation before proposing changes.

Search for related:

- components;
- imports;
- routes;
- CSS;
- configuration;
- tutorial pages;
- plugins;
- scripts;
- workflows.

### 2. Classify

Determine which architectural layer should own the change.

### 3. Evaluate Blast Radius

Consider impact on:

- existing student MDX;
- component APIs;
- GitHub Pages routing;
- environment variables;
- build output;
- tutorial content;
- generated repositories;
- Docusaurus upgrades.

### 4. Implement Minimally

Prefer the smallest solution that fits the existing architecture.

Do not add an abstraction without a concrete need.

### 5. Validate

When application code or configuration changes, validate a production build from `documentation/`:

```bash
yarn build
```

When relevant, validate production-like behavior with appropriate:

```text
ORG_NAME
PROJECT_NAME
```

Run additional focused checks for the feature being changed.

### 6. Explain Consequences

For meaningful changes, report:

- what changed;
- why that layer owns the behavior;
- student-facing impact;
- maintainer impact;
- compatibility concerns;
- tutorial/documentation updates.

---

## Design-Decision Mode

When asked for design advice rather than direct implementation, do not immediately generate a large patch.

For significant design decisions, respond approximately with:

### Recommendation

State the preferred approach.

### Repository Fit

Explain how it fits the current architecture and which layer should own it.

### Alternatives

Describe realistic alternatives.

### Tradeoffs

Explain costs and benefits.

### Student Impact

Explain how student authors or readers are affected.

### Maintainer Impact

Explain the effect on the reusable template.

### Compatibility

Identify downstream or migration risks.

### Implementation Direction

Identify likely files/layers without over-implementing before the decision is made.

---

## Challenge Proposed Features

Do not assume every proposed feature belongs in the template.

Call out when:

- native Docusaurus already solves the problem;
- an existing component already solves it;
- Markdown is sufficient;
- the feature belongs in `tutorial/`;
- the feature belongs in student content;
- it creates unnecessary recurring maintenance;
- it creates too much student configuration;
- it complicates Docusaurus upgrades;
- it risks GitHub Pages compatibility;
- a simpler interaction communicates the same information.

Also identify cases where centralizing behavior in the template would remove significant repeated work across student teams.

---

## Design for Three Users

Evaluate decisions for three users.

### Student Author

Writes Markdown/MDX and should not need deep Docusaurus knowledge.

### Documentation Reader

Needs clear navigation, readable technical information, and a professional presentation.

### Template Maintainer

Needs an architecture that can be upgraded, debugged, and reused across semesters.

A good solution balances all three.

---

## Definition of a Good Change

A good change generally:

- makes documentation easier to author or understand;
- fits the existing architecture;
- reduces repeated work across projects;
- keeps student-facing APIs simple;
- works under GitHub Pages repository-subpath hosting;
- preserves accessibility;
- avoids unnecessary dependencies;
- remains maintainable across semesters;
- keeps complexity encapsulated;
- avoids breaking existing student documentation without strong justification.

The goal is not to maximize features.

The goal is to make `tu-cis-4398-docs-template` a reliable, polished, reusable documentation platform for CIS 4398 capstone projects.
