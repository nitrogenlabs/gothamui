# Scoped document head

Import `DocumentHead` and descriptor types from `@nlabs/gothamui/head`. Import `renderDocumentHead` from `@nlabs/gothamui/head/static` for Node/static rendering; this entry has no React, router, DOM or styles dependency.

Pass a stable nonempty `owner` and a complete `metadata` snapshot with optional `title`, `canonicalUrl`, `meta` (`name` or `property`, plus `content`) and `jsonLd` (`id`, JSON-compatible `value`). Empty string values are preserved. JSON-LD requires plain JSON values: finite numbers, no cycles, accessors, array holes or serialization hooks. Validation and script collision checks precede DOM writes.

Distinct metadata owners overlap by mount order; updates do not promote priority. Cleanup restores original values/node identity by default, or removes nodes created by the owner. `missingTags: 'ignore'` skips absent meta/canonical/script nodes. Metadata cleanup supports `restore`/`retain`; structured-data cleanup also supports `remove`. Removal only affects the explicitly identified script. Duplicate active owners and conflicting script IDs/types/owner markers fail visibly. Unrelated scripts remain untouched.

External value/attribute writes or node replacements survive cleanup. A subsequent explicit update resolves the current target and can reclaim valid metadata or a compatible script; its external state becomes the restoration baseline. Browser effects and events remain outside the pure serializer. The component renders null and is safe to render in Node.

Static rendering uses `renderDocumentHead({metadata, owner})`. Output escapes markup and JSON script-breaking text and marks each JSON-LD script with `data-gotham-head-owner`. Give the browser the same owner/ID to adopt the static node. Product schema objects, route policy, defaults and analytics remain in the consumer.

This capability is validated locally via the Giraldo archive. It requires a compatible published release before registry-version adoption; do not assume sibling checkout exports are published.
