# GitHub Action: `node-draft-releaser`

[![GitHub Marketplace version](https://img.shields.io/github/release/JamesMGreene/node-draft-releaser.svg?label=Marketplace&logo=github)](https://github.com/marketplace/actions/node-draft-releaser)

Automatically publish an existing Draft Release when the `"package.json"` version changes.

This Action [pairs](#sample-cooperative-workflow-including-release-drafter) exquisitely well with [Release Drafter](https://github.com/marketplace/actions/release-drafter).

It is also a great addition to any workflows that culminate in [publishing a Node package to an NPM Registry such as the GitHub Package Registry](#sample-workflows-including-publishing-to-github-package-registry).

## Usage

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
  release:
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

### Sample Cooperative Workflow Including Release Drafter

Setting up another **separate** GitHub Actions workflow using [Release Drafter](https://github.com/marketplace/actions/release-drafter) is a great combination with this Action! 💪

```yaml
name: 'Release Drafter'

on: push
jobs:
  release-drafter:
    runs-on: ubuntu-latest
    steps:
      # Drafts your next Release notes as Pull Requests are merged into "master"
      - uses: toolmantim/release-drafter@v5.2.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

_IMPORTANT:_ To enable Release Drafter, you must also include a [`.github/release-drafter.yml` configuration file](https://github.com/marketplace/actions/release-drafter#example) in your repository.

### Sample Chained Workflow Including Publishing to GitHub Package Registry

The following GitHub Actions workflow will publish an existing Draft Release using this Action and then publish that version to the GitHub Package Registry.

```yaml
name: 'Publish to GPR'

on:
  push:
    # branches to consider in the event; optional, defaults to all
    branches:
      - master
    # file paths to consider in the event; optional, defaults to all
    paths:
      - package.json

jobs:
  release-and-publish:
    runs-on: ubuntu-latest
    steps:
      # Does a checkout of your repository at the pushed commit SHA
      - uses: actions/checkout@v1
      # Checks for a version bump to publish an existing Draft Release
      - uses: JamesMGreene/node-draft-releaser@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      # Set up the local Node environment for the NPM CLI
      - uses: actions/setup-node@v1
        with:
          node-version: '10.x'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      # Publish the new version to GPR
      - uses: actions/setup-node@v1
        with:
          node-version: '10.x'
          registry-url: 'https://npm.pkg.github.com'
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## License

[MIT License](LICENSE.md) (c) 2019 James M. Greene
