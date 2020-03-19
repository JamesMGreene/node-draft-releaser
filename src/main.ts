import * as core from '@actions/core';
import findTargetDraftRelease from './find-target-draft-release';
import getDraftReleases from './get-draft-releases';
import getTagNames from './get-tag-names';
import getVersion from './get-version';
import publishDraftRelease from './publish-draft-release';
import verifyRequiredEnv from './verify-required-env';
import verifyVersionBump from './verify-version-bump';

function setNeutralCancellation(message: string): void {
  process.exitCode = 78;
  core.warning(message);
}

async function main() {
  try {
    // Verify all required environment variables and secrets exist, or else throw
    verifyRequiredEnv();

    // Verify the triggering event is a PushEvent
    if (process.env.GITHUB_EVENT_NAME !== 'push') {
      return setNeutralCancellation('This GitHub Action may only be run for "push" events');
    }

    //
    // Get the Action's input values
    //
    const tagMustMatch = core.getInput('allow_unmatched_draft_tag').toLowerCase() === 'false';
    const allowNameUpdate = core.getInput('allow_release_name_update').toLowerCase() === 'false';

    // Get the package version from the current commit
    const version = getVersion();
    if (!version) {
      return setNeutralCancellation('No version is set in "package.json"');
    }

    // Get all existing tag names for the repository
    const tagNames = await getTagNames();

    // Verify the current version does not yet have a corresponding tag in existence
    const isBumping = verifyVersionBump(version, tagNames);
    if (!isBumping) {
      return setNeutralCancellation('No new version was introduced in "package.json"');
    }

    // Get all existing releases that are in a draft status
    const draftReleases = await getDraftReleases();

    // Filter down to the most appropriate draft release
    const targetDraft = findTargetDraftRelease(draftReleases, tagMustMatch, version);
    if (targetDraft == null) {
      throw new Error('No appropriate Draft Release could be found');
    }

    // Publish that draft release
    const publishedRelease = await publishDraftRelease(targetDraft, version, allowNameUpdate);

    //
    // Set the Action's output values
    //
    core.setOutput('version', version);
    core.setOutput('release_id', publishedRelease.id.toString());
    core.setOutput('release_url', publishedRelease.html_url);
    core.setOutput('release_name', publishedRelease.name);
  } catch (err) {
    core.setFailed(err.message);
  }
}

export default main;
