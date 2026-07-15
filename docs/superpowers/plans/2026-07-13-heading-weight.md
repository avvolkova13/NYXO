# NYXO Heading Weight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Cyrillic heading readability by reducing the existing Alumni Sans display weight by two steps.

**Architecture:** Change the shared heading rule in `src/styles.css` so Hero and section headings remain synchronized. Verify the rendered value and responsive integrity in the running Vite application.

**Tech Stack:** React, TypeScript, CSS, Vite

## Global Constraints

- Keep Alumni Sans Variable.
- Change only primary page and section heading weight from `900` to `700`.
- Preserve typography metrics, layout, copy, and all non-heading elements.

---

### Task 1: Reduce the shared display-heading weight

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the shared selector for `.hero h1` and landing section `h2` elements.
- Produces: a computed `font-weight` of `700` for those headings.

- [ ] **Step 1:** Confirm the current shared heading rule uses `font-weight: 900`.
- [ ] **Step 2:** Change that declaration to `font-weight: 700` without modifying adjacent typography metrics.
- [ ] **Step 3:** Run `npm run typecheck`, `npm test -- --run`, and `npm run build`; expect all commands to exit successfully.
- [ ] **Step 4:** Reload the local page and confirm Hero and section headings compute to weight `700` with no horizontal overflow at desktop and mobile widths.

