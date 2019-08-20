import { context, GitHub } from '@actions/github';
import semver from 'semver';
import { IRelease } from './types/index';

async function publishDraftRelease(draftRelease: IRelease, version: string): Promise<IRelease> {
  const octokit = new GitHub(process.env.GITHUB_TOKEN as string);

  const prereleaseParts = semver.prerelease(version);
  const isPrerelease = Array.isArray(prereleaseParts) && prereleaseParts.length > 0;

  // Publish the release by marking it as a non-draft
  // IMPORTANT: This will also create the associated tag from the
  // current Commit SHA from this "push" event!
  const { data: publishedRelease } = await octokit.repos.updateRelease({
    ...context.repo,
    draft: false,
    name: draftRelease.name || version,
    prerelease: isPrerelease,
    release_id: draftRelease.id,
    tag_name: version,
    target_commitish: process.env.GITHUB_SHA,
  });

  return publishedRelease as IRelease;
}

export default publishDraftRelease;
