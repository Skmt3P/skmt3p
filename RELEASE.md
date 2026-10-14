# Portfolio releases

The source is `layers/skmt3p` in `Skmt3P/skmt3p-monorepo`. A release starts by
tagging a commit on `develop` with a product-scoped semantic version such as
`portfolio/1.2.3`.
The sync workflow copies that exact source to `Skmt3P/skmt3p` on `master`, then
pushes the same version tag in the public repository. Its Pages workflow checks
the tag, verifies that it points to a commit on `master`, and publishes `docs/`.

Before the first tag release, merge both the monorepo and public repository
workflow changes. Then change the public repository's Pages **Build and
deployment > Source** from `Deploy from a branch` to `GitHub Actions`. Permit
semantic version tags to deploy to its `github-pages` environment. The existing
environment currently permits only the `master` branch. Until the Pages source
is changed, a direct push to `master` still publishes without a release tag.

Do not move an existing version tag. A failed release can be recovered by
rerunning its workflow or by tagging a reviewed corrective commit with a newer
version. To roll back the Pages source setting, restore the previous
`master/docs` branch source and verify the public site before further syncs.
