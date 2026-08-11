---
sidebar_position: 1
description: API design guidance and project-specific API documentation.
---

# API Design

:::caution Starter content - API assignment
This page is not ready for submission until your team replaces this starter outline with project-specific API design content and removes this callout.

- Describe the public modules, classes, services, or endpoints your project exposes.
- Explain how the API fits into the architecture from Part I.
- Document parameters, return values, exceptions, preconditions, and postconditions where relevant.
:::

## Purpose

The Design Document - Part II API gives the complete design of the software implementation. Prefer generating a first draft from structured comments, then augmenting it with design context that generated output cannot provide by itself.

## Architecture Review

Replace this section with a review of the software architecture for each module specified in Design Document - Part I Architecture. Include class diagrams or service diagrams as references where they help.

## API Documentation Requirements

For each public class, module, service, or endpoint, document:

- purpose;
- data fields or request and response fields;
- methods or operations;
- preconditions and postconditions;
- parameters and data types;
- return values or output variables;
- exceptions or error responses;
- recovery procedures for user-facing errors.

At the top level, or where appropriate, all exceptions should be caught and transformed into a meaningful user-facing error message. Avoid vague error messages that do not explain what happened or what the user can do next.
