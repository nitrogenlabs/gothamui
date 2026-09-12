# GothamUI release procedure

1. Run `npm test`, the rendering Playwright suite, and `npm run build` through the project's Lex workflows. Inspect `npm pack --dry-run`, including every export and stylesheet.
2. Rename `nitrogenlabs/gothamjs` to `nitrogenlabs/gothamui` and update the local remote. Keep the old repository name unused so GitHub's redirects remain available.
3. Authenticate to npm as a maintainer of the `@nlabs` scope. Publish `@nlabs/gothamui@1.8.0` with public access. Verify registry metadata and install the package in a clean consumer before continuing.
4. Run `npm run deprecate:gothamjs`. The script refuses to deprecate the old package until the matching GothamUI release exists. Do not unpublish existing versions.
5. In the NitrogenX repository, install the published `@nlabs/gothamui` dependency and commit the regenerated lockfile. Build, test, and deploy the GothamUI microsite and updated parent site.
6. Provision and verify `gothamui.nitrogenx.co` before redirecting `gothamjs.nitrogenx.co`. Preserve deep links and query strings. Keep the old hostname and certificate active for redirects.

The local checkout folder can retain its existing name without affecting the package or hosted repository. Rename the saved workspace separately when no tasks are using it.

References: [npm package deprecation](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/), [GitHub repository renames](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).
