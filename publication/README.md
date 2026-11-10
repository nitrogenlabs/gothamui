# Reviewed GothamUI1.15.1 release preparation

Status: prepared, not activated, not published. The real `gotham-1.15.1.approved.json` marker is absent. Preparation commits cannot trigger the candidate workflow; only a separately authorized push adding that exact marker on `codex/gotham-chat-type-packaging` can activate it. The example marker is inert.

The committed archive is the unchanged reviewed `302f27bbe1c55cb0ce5c90def84f9b9d9885db55286f40983c1aaf4841cc3a21` payload (2008719bytes). Qualified source is `f1216044087b46272bccf2fb3aef524519507bca`: normal pre-commit492unit tests passed17.01s and normal pre-push20E2E tests passed16.4s, including staged type changes, merge-only changes, add/revert ranges and nested Git environment isolation. Source HEAD, local refs, index and shared config remained unchanged across the final push. Every current published library file and package manifest matches the frozen archive; the archive was neither rebuilt nor repacked for the development-hook changes.

Expected registry state before activation:

```json
{"reactorbox":"1.11.3-architecture.1","latest":"1.15.0"}
```

The package must remain public and1.15.1 must be absent. The only accepted post-publication map is:

```json
{"reactorbox":"1.11.3-architecture.1","latest":"1.15.0","vault-cutover":"1.15.1"}
```

The new workflow preserves the existing publisher concurrency group. It verifies approval/intent/workflow/archive hashes, original qualified source, authenticated version absence and the entire tag map before installing exact Lex2.1.5 with lifecycle scripts disabled. It does not rebuild the archive or call the existing main publisher. It checks the frozen payload in a disposable strict Bundler/NodeNext consumer with successful `npm ls --all --json`, retains a sanitized peer graph plus its actual package manifest/lock/type fixtures (no node_modules), uploads the exact artifact, then invokes public Lex `publish --packagePath ... --tag vault-cutover` once. Explicit npm access is public and archive lifecycle scripts remain disabled. Registry bytes/SHA512, public access, all tags and unchanged latest are verified afterward. Read visibility may wait within a bound; publication is never automatically repeated.

After Root's final source/workflow/intent approval, adding the exact bytes of `gotham-1.15.1.approved.example.json` as `gotham-1.15.1.approved.json` and pushing that marker activates the workflow. Its descriptor hash binds the reviewed workflow and archive. Do not add the marker before explicit authorization. Do not use `publish.yml`, which rebuilds and normally moves latest. Preserve prior superseded archives and release evidence; none is a product dependency substitute.
