#!/usr/bin/env bash

# Checkout the "master" branch
git checkout master

# Install all of the dependencies
npm install

# Run the linter
npm run lint

# Ensure consistent formatting
npm run format

# Ensure all source files are staged, if updated
git add -A src/

# Execute the tests
npm test

# Transpile
npm run build

# Version bumping level: major, minor, patch
BUMP_LEVEL=${1:-patch}

# Bump the version and capture the new version (vX.Y.Z)
PKG_VERSION=$(npm version ${BUMP_LEVEL} --no-git-tag-version)

# Remove the first character from the version (vX.Y.Z -> X.Y.Z)
PKG_VERSION=${PKG_VERSION#?}

# Replace periods with spaces, split into an array
VERSION_PARTS=( ${PKG_VERSION//./ } )

# Grab the first version part as the major version
MAJOR_VERSION=${VERSION_PARTS[0]}

# Add the updated "package.json" and "package-lock.json" files
git add package*.json

# Commit the changes to the "master" branch
git commit -m "Bump version to ${PKG_VERSION}"

# Push the latest "master" branch
git push origin



#
# IMPORTANT:
# Make tagged versions with the "node_modules" directory included
# to allow direct usage from GitHub Actions Workflows
#

# Create temporary branch name
RELEASE_BRANCH=release/v${MAJOR_VERSION}

# Checkout a new temporary branch for the major version
git checkout -b ${RELEASE_BRANCH}

# Removes "node_modules/" from the ".gitignore" file
sed -i '/node_modules/d' .gitignore

# Stage the updated ".gitignore" file
git add .gitignore

# Remove the "node_modules/" directory
rm -rf node_modules/

# Install only the production dependencies
npm install --production

# Stage the entire "node_modules/" directory
git add node_modules/

# Commit the changes
git commit -m 'Add node_modules directory'

# Create a specific tag (vX.Y.Z)
git tag v${PKG_VERSION}

# Check for a major version tag (vX) and delete it if it exists
if [ $(git tag -l "v${MAJOR_VERSION}") ]; then
  # Delete the local tag
  git tag --delete v${MAJOR_VERSION}
  # Delete the remote tag
  git push --delete origin v${MAJOR_VERSION}
fi

# Create or recreate a major version tag (vX)
git tag v${MAJOR_VERSION}

# Switch back to the "master" branch
git checkout master

# Delete the temporary branch
git branch -D ${RELEASE_BRANCH}

# Push the new tags
git push origin --tags

# Remove the "node_modules/" directory
rm -rf node_modules/

# Reinstall the full set of dependencies
npm install
