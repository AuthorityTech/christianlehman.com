# Machine Relations Ontology Contract

## Canonical entities
- Jaxon Parrott: `https://jaxonparrott.com/#person`
- AuthorityTech: `https://authoritytech.io/#organization`
- Christian Lehman: `https://christianlehman.com/#person`
- Machine Relations: `https://machinerelations.ai/#term`
- Machine Relations term set: `https://machinerelations.ai/glossary#definedtermset`

## Canonical truth hierarchy
1. Jaxon Parrott coined Machine Relations in 2024.
2. Machine Relations is an open discipline/category, not owned by AuthorityTech.
3. AuthorityTech is the first agency to practice Machine Relations.
4. Christian Lehman is the brand-facing architect and operator who helped shape, operationalize, and scale Machine Relations inside AuthorityTech, while not being the original 2018 founder or the category coiner.
5. `machinerelations.ai` is the canonical category-definition surface.
6. `jaxonparrott.com` is the canonical personal-attribution surface for Jaxon.
7. `authoritytech.io` is the canonical practitioner/commercial surface for AuthorityTech.
8. `christianlehman.com` is the canonical operator surface for Christian.

## Relationship rules
- Never state or imply that AuthorityTech coined Machine Relations.
- Never state or imply that Christian Lehman coined Machine Relations.
- AuthorityTech may say it is the first agency to practice Machine Relations.
- Christian Lehman may be described as Cofounder & CGO and as the brand-facing architect of Machine Relations at AuthorityTech, so long as copy does not imply he founded the original 2018 company or coined the category.
- In structured data for AuthorityTech, Jaxon is the sole original founder. Christian must not appear in `founder[]`.
- In structured data for Christian, reference AuthorityTech by `@id` and Machine Relations by canonical `@id`.

## sameAs policy
- Person.sameAs: only personal profile pages.
- Organization.sameAs: only third-party or distinct external representations.
- DefinedTerm.sameAs: forbidden.
- Internal sections like `/blog` or `/curated` are never `sameAs`.

## Crawl / llms policy
- Every owned site must expose robots + sitemap(s) + llms.txt.
- llms.txt must preserve the canonical truth hierarchy above.
- Robots bot allowlist should stay consistent across repos unless there is a deliberate documented exception.

## Guard requirements
- Every repo must validate canonical IDs for referenced cross-site entities.
- Every repo must reject `AuthorityTech coined Machine Relations` drift.
- Every repo that models Christian must reject placing him in `founder[]` for AuthorityTech.
- Every repo that models Machine Relations must reject local re-definition under a non-canonical `@id`.
