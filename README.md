# GitHub Action: `node-draft-releaser`

[![GitHub Marketplace version](https://img.shields.io/github/release/JamesMGreene/node-draft-releaser.svg?label=Marketplace&logo=github)](https://github.com/marketplace/actions/node-draft-releaser)

Automatically publish an existing Draft Release when the `"package.json"` version changes.

This Action [pairs](#including-release-drafter) exquisitely well with [Release Drafter](https://github.com/marketplace/actions/release-drafter).

It is also a great addition to any workflows that culminate in [publishing a Node package to an NPM Registry such as the GitHub Package Registry](#including-publishing-to-github-package-registry).

## Usage

### Configuration

#### Secrets

In addition to a handful of the standard environment variables provided during a GitHub Actions workflow run, this Action also expects the following Secret(s) to be provided:

 - `GITHUB_TOKEN` _(required)_
     - The [`GITHUB_TOKEN` Secret](https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret) is a GitHub App installation token scoped to a repository. GitHub creates the `GITHUB_TOKEN` secret for you by default, but you must include it in your workflow file in order for this Action to use it.

#### Inputs

This Action can react to the following inputs:

 - `allow_unmatched_draft_tag` _(optional)_
     - Should this Action be allowed to publish an existing Draft Release that is _not_ slated to create a Tag matching the new version number?
     - Valid values: `'true'` or `'false'` _(as a **string**)_
     - Defaults to `'true'`.

#### Outputs

This Action provides the following outputs:

 - `version`
     - The new version number that was released, e.g. `1.0.0-beta.2`

 - `release_id`
     - The ID of the Release

 - `release_url`
     - The URL to view the published Release page in the GitHub UI

## Examples

### Basic Usage

In one of your GitHub Actions V2 workflow YAML files:

```yaml
name: 'Publish Draft Release'

on:
  push:
    # branches to consider in the event; optional, defaults to all
    branches:
      - master
    # file paths to consider in the event; optional, defaults to all
    paths:
      - package.json

jobs:
  publish_draft_release_on_version_bump:
    runs-on: ubuntu-latest
    steps:
      # Does a checkout of your repository at the pushed commit SHA
      - uses: actions/checkout@v1
      # Checks for a version bump to publish an existing Draft Release
      - uses: JamesMGreene/node-draft-releaser@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          allow_unmatched_draft_tag: 'false'  # default value = 'true'
```

### Sample Chained Workflows

#### Including Release Drafter

Setting up your GitHub Actions workflow to also use [Release Drafter](https://github.com/marketplace/actions/release-drafter) is a great combination with this Action! 💪

_IMPORTANT:_ To enable Release Drafter, you must also include a [`.github/release-drafter.yml` configuration file](https://github.com/marketplace/actions/release-drafter#example) in your repository.

```yaml
name: 'Draft Releases & Release Drafts'

on:
  push:
    # branches to consider in the event; optional, defaults to all
    branches:
      - master

jobs:
  update_draft_release:
    runs-on: ubuntu-latest
    steps:
      # Drafts your next Release notes as Pull Requests are merged into "master"
      - uses: toolmantim/release-drafter@v5.2.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  publish_draft_release_on_version_bump:
    needs: [update_draft_release]
    runs-on: ubuntu-latest
    steps:
      # Does a checkout of your repository at the pushed commit SHA
      - uses: actions/checkout@v1
      # Checks for a version bump to publish an existing Draft Release
      - id: github_release
        uses: JamesMGreene/node-draft-releaser@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      # Show the Release URL, just for fun
      - run: echo "Released at $RELEASE_URL"
        env:
          RELEASE_URL: ${{ steps.github_release.outputs.release_url }}
```

#### Including Publishing to GitHub Package Registry

Another great chaining opportunity is following this Action with one to publish the new version to the GitHub Package Registry.

```yaml
name: 'Release Management'

on:
  push:
    # branches to consider in the event; optional, defaults to all
    branches:
      - master

jobs:
  update_draft_release:
    runs-on: ubuntu-latest
    steps:
      # Drafts your next Release notes as Pull Requests are merged into "master"
      - uses: toolmantim/release-drafter@v5.2.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  publish_draft_release_on_version_bump:
    needs: [update_draft_release]
    runs-on: ubuntu-latest
    steps:
      # Does a checkout of your repository at the pushed commit SHA
      - uses: actions/checkout@v1
      # Checks for a version bump to publish an existing Draft Release
      - id: github_release
        uses: JamesMGreene/node-draft-releaser@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      # Show the Release URL, just for fun
      - run: echo "Released at $RELEASE_URL"
        env:
          RELEASE_URL: ${{ steps.github_release.outputs.release_url }}

  publish_package_to_gpr:
    needs: [publish_draft_release_on_version_bump]
    runs-on: ubuntu-latest
    steps:
      # Does a checkout of your repository at the pushed commit SHA
      - uses: actions/checkout@v1
      # Set up the local Node environment for the NPM CLI
      - uses: actions/setup-node@v1
        with:
          node-version: '10.x'
          registry-url: 'https://npm.pkg.github.com'
      # Install dependencies in case there are any publish-related scripts
      - run: npm install
      # Publish the new version to GPR
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

[MIT License](LICENSE.md) (c) 2019 James M. Greene
