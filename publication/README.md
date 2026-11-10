# Reviewed GothamUI1.15.1 release preparation

Status: published and independently verified. Root activated the reviewed marker at `bf0aae4a2c060626dd314d23f27be55658f594c3`; CI42795587919 succeeded, including fresh nested consumer, peer graph, strict declarations and the single immutable-archive publication. The example marker remains inert. Do not repeat publication.

The current frozen archive is `bd233f934c5f59f59f87d44a53218d7ee4e64ce2d87945aa2934bffa9a755894` (2008734bytes), from clean qualified source `6c24259c94189b8d205d0bd378ac89ddae4f4376`. The old302f27 archive remains preserved, superseded and unpublished. CI42791041140 rejected that old payload before publication because HeadlessUI2.2.10's public declarations import an undeclared `@floating-ui/react-dom` type dependency. The owner manifest/lock now declares compatible public2.1.9 directly; no consumer workaround or installed package patch is used.

Fresh qualification:492unit tests passed17.15s,20E2E tests passed15.6s, and the full build/public strict modes passed. A separate fresh lean nested consumer installed688packages without Lex, passed `npm ls --all --json`, and passed strict Bundler/NodeNext through the existing public Lex compiler. HeadlessUI resolved the declared dependency inside GothamUI's own nested node_modules; the package was not a symlink. Its manifest/lock/type fixtures/peer graph/compiler results are retained locally; only its closed478MiB node_modules was removed after an empty lsof check. The CI workflow repeats the full Lex+nested peer-graph qualification before publication.

Recorded public registry map before activation:

```json
{"reactorbox":"1.11.3-architecture.1","latest":"1.15.0"}
```

Version1.15.1 was absent before the successful run. The verified post-publication map is:

```json
{"reactorbox":"1.11.3-architecture.1","latest":"1.15.0","vault-cutover":"1.15.1"}
```

The workflow preserves the existing publisher concurrency group. It verifies approval/intent/workflow/archive hashes, qualified source, authenticated version absence and the entire tag map. It installs exact Lex2.1.5 with lifecycle scripts disabled, never rebuilds the archive, and never invokes the main publisher. It requires a successful disposable nested peer graph and strict Bundler/NodeNext checks, retaining its sanitized graph and actual manifest/lock/type fixtures without node_modules. It uploads the archive, invokes public Lex `publish --packagePath ... --tag vault-cutover` once with public access/scripts disabled, then verifies registry bytes/SHA512/public access/all tags. Read visibility may wait within a bound; publication is never automatically repeated.

Independent direct registry download matched all reviewed archive bytes and SHA512 `ttXpgPQ5VfTpMqEWOBWfcQpfYYzyKz00hXWkMd4bmt/4IhjyxcFoL6OrhuZuA0FCroW/Yija7fGp/hXQYwGaqQ==`; public access and the complete tag map above were verified. Latest remains1.15.0. Vault subsequently adopted the exact registry1.15.1 in its UI: all516 installed package files matched this archive; no source alias or local archive dependency was used.

Do not use `publish.yml` for this release; it rebuilds and normally moves latest. The successful reviewed workflow has already run. Prior superseded archives and failed pre-publication CI evidence remain preserved; none is a product dependency substitute.
