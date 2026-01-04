# Audit Plan: Fundraising Event Codebase

This document outlines the systematic audit and improvement of the fundraising-event codebase.

## Audit Protocol (10 Steps per Group)

For every feature group, we will perform the following sequential steps:

1.  **Step 1: Instruction Alignment**
    - [ ] Cross-reference implementation with `.agent/specs.md` for functional accuracy.
    - [ ] Verify alignment with `.agent/agents.md` for architectural and coding standards.

2.  **Step 2: SOLID & Clean Code Audit**
    - [ ] **S**: Single Responsibility Principle - ensure classes/functions do one thing.
    - [ ] **O**: Open/Closed - entities are open for extension, closed for modification.
    - [ ] **L**: Liskov Substitution.
    - [ ] **I**: Interface Segregation.
    - [ ] **D**: Dependency Inversion - proper DI/IoC usage.
    - [ ] **Readability**: Semantic naming and logic easy to follow.

3.  **Step 3: Complexity & Performance Check**
    - [ ] Analyze cognitive complexity (aim for < 10 per method).
    - [ ] Check for unnecessary re-renders (Frontend) or inefficient DB queries (Backend).

4.  **Step 4: Linting & Type Safety**
    - [ ] Run `pnpm lint` and fix all warnings/errors.
    - [ ] Ensure `Strict` TypeScript mode is respected. No `any` types.

5.  **Step 5: Test Verification (>80% Coverage)**
    - [ ] Run unit tests and check coverage reports.
    - [ ] Add missing tests to reach the 80% threshold.
    - [ ] Perform E2E tests for the feature flow.

6.  **Step 6: Security Audit**
    - [ ] **Input Validation**: All inputs (DTOs, Zod) strictly validated.
    - [ ] **RBAC**: Verify appropriate guards and roles are applied.
    - [ ] **PII/Privacy**: Check for accidental exposure of PII or sensitive keys.

7.  **Step 7: Internationalization (i18n)**
    - [ ] Audit for hardcoded strings.
    - [ ] Ensure keys exist in both `en.default.json` and `fr.default.json`.
    - [ ] **Remove fallbacks from code**: Ensure `t('key')` is used without a default text argument.

8.  **Step 8: Documentation (Docs/ MkDocs)**
    - [ ] Update `/docs` folder with feature overview, setup, and usage.
    - [ ] Ensure JSDoc for complex functions.

9.  **Step 9: Deprecation & Modernization**
    - [ ] Identify and replace deprecated methods or library versions.
    - [ ] Optimize for React 19 / NestJS latest standards.

10. **Step 10: Final Validation**
    - [ ] User review and approval before moving to the next group.

---

## Audit Execution Groups

1.  **Group 1: Shared Foundation** (Packages: `types`, `white-labeling`)
2.  **Group 2: Identity & Authentication** (API `auth` & Web `auth`)
3.  **Group 3: Staff & Collector Interface** (API `staff` & Web `staff`)
4.  **Group 4: Event Management** (Core API `events` & Web `events` hooks)
5.  **Group 5: Admin Dashboard UI** (Web `admin` screens)
6.  **Group 6: Donation Workflow** (Web `donation` & logic)
7.  **Group 7: Payment & Stripe Integration** (API `donation` webhooks & security)
8.  **Group 8: Real-time Visualization** (API `gateway` & Web `live` screen)
9.  **Group 9: Communication & Post-Processing** (API `mail`, `pdf`, `queue`, `export`)
10. **Group 10: Public Landing Pages** (Web `public` marketing pages)
