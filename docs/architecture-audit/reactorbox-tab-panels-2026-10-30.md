# Reactorbox content-tab capability

The consumer uses GothamUI1.12.0. Both that installed release and registry1.13.0 expose navigation-oriented `Tabs` (aria-current, mobile select), without a public content-tab/panel contract. The approved Reactorbox ChatGPT plan requires accessible peer content views with underline tabs at320px, reciprocal ARIA relationships and keyboard navigation.

GothamUI owns this presentation capability. It now forwards the existing maintained Headless UI `TabGroup` family and supported public prop aliases through root/components. There is no app copy, new dependency, callback protocol, or change to legacy Tabs. Tests cover actual maintained behavior, and a real-browser mobile happy path exercises the public family composition.

Publication and Reactorbox registry adoption remain separate gates. Do not use a sibling import, source alias or app runtime tarball dependency. No database/customer/environment data is used by this capability.

## Verification before release

- Fresh lifecycle-disabled install succeeds; no dependency was added or upgraded. Candidate version1.14.0 records the additive public API.
- Lex build including declarations/styles succeeds. Existing legacy Tabs regression tests remain unchanged.
- Full suite after the required lib build:455tests across126files pass. Global coverage: statements96.05%, branches90.19%, functions95.06%, lines96.2%; existing audited per-file thresholds pass. The new production module only forwards maintained public exports and contains no independent protocol implementation.
- Focused public-family integration assertions cover reciprocal ARIA, disabled skipping, roving focus/wrap, Home/End, automatic/manual activation and public render props.
- Playwright through public Lex passes the real-browser320px underline-tab happy path, including focus/selection/panel checks and pointer cursors.
- Raw standalone producer tsc retains59 errors in unchanged third-party declaration/Jest/WebCodecs/legacy Chat files. No compiler flags or production types were weakened to conceal those baseline failures. Lex declaration generation passes; isolated packed-consumer compilation remains a separate check.
- First full-suite attempt began before the repository's built-lib fixtures existed; it failed only the existing built auth-export import. After build, the full unassisted suite passed. The original sibling checkout and its modified.env are untouched.

Registry publication requires separate authorization and an explicit intended tag. Freeze only from a clean committed producer; verify the same archive in an isolated consumer before publication/adoption. Do not implicitly promote latest.
