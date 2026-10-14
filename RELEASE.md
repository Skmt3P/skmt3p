# Portfolio releases

The source is `layers/skmt3p` in `Skmt3P/skmt3p-monorepo`. A release starts by
tagging a commit on `develop` with a product-scoped semantic version such as
`portfolio/1.2.3`.
The sync workflow copies that exact source to `Skmt3P/skmt3p` on `master`, then
pushes the same version tag in the public repository. Its Pages workflow checks
the tag, verifies that it points to a commit on `master`, and publishes `docs/`.

Before the first tag release, merge both the monorepo and public repository
changes. On 2026-10-14, the GitHub Pages API reported `build_type: workflow`
for the public repository, and its `github-pages` environment allowed the
`master` branch and `portfolio/*` tags. Recheck both settings immediately
before release. The workflow itself accepts only strict `portfolio/X.Y.Z`
tags pointing to a commit on `master`; the environment pattern alone is
broader than that validation.

Do not move an existing version tag. A failed release can be recovered by
rerunning its workflow or by tagging a reviewed corrective commit with a newer
version. If the Pages deployment source is changed, restore the reviewed
workflow setting and verify the public site before further syncs.
