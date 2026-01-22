# 1. Record architecture decisions

Date: 2026-01-22

## Status

Accepted

## Context

We need to record architectural decisions, such as the choice of database, framework, or patterns, so that we don't lose the context of why these decisions were made ("history amnesia").

## Decision

We will use Architecture Decision Records (ADRs) to document significant architectural decisions.

We will place these ADRs in the `docs/adr` directory.

We will number the ADRs sequentially (0001, 0002, ...).

## Consequences

* We will have a history of decisions.
* New team members can understand the "why" behind the code.
* Writing an ADR requires a bit of effort when making a decision.
