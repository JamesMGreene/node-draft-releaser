import { IRelease } from './types/index';

function findTargetDraftRelease(
  draftReleases: IRelease[],
  tagMustMatch: boolean,
  version: string,
): IRelease | null {
  let targetRelease: IRelease | null = null;
  let defaultRelease: IRelease | null = null;

  const pushedBranch = process.env.GITHUB_REF as string;
  const pushedCommitish = pushedBranch.replace(/^refs\/heads\//, '');

  for (const draftRelease of draftReleases) {
    if (draftRelease.target_commitish === pushedCommitish) {
      defaultRelease = draftRelease;

      if (version === draftRelease.tag_name) {
        targetRelease = draftRelease;
        break;
      }
    }
  }

  if (!tagMustMatch && targetRelease === null && defaultRelease !== null) {
    targetRelease = defaultRelease;
  }

  return targetRelease;
}

export default findTargetDraftRelease;
