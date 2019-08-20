# GitHub Action: `node-draft-releaser`

[![GitHub Marketplace version](https://img.shields.io/github/release/JamesMGreene/node-draft-releaser.svg?label=Marketplace&logo=github)](https://github.com/marketplace/actions/node-draft-releaser)

Automatically publish an existing Draft Release when the `"package.json"` version changes.

This Action pairs exquisitely well with [Release Drafter](https://github.com/marketplace/actions/release-drafter).

It is also a great addition to any workflows that culminate in publishing a Node package to an NPM Registry such as the GitHub Package Registry.

## Usage

In one of your GitHub Actions V2 workflow YAML files:

```yaml
on:
  push:
    branches:
      - master
    # file paths to consider in the event; optional, defaults to all.
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
