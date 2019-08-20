import { context, GitHub } from '@actions/github';
import { IRelease } from './types/index';

async function getDraftReleases(): Promise<IRelease[]> {
  try {
    const octokit = new GitHub(process.env.GITHUB_TOKEN as string);

    // Get ALL of the GitHub Releases for this repository
    const options = octokit.repos.listReleases.endpoint.merge({ ...context.repo, per_page: 100 });
    const releases = (await octokit.paginate(options)) as IRelease[];

    // Filter down to just the Draft Releases
    return releases.filter(release => release.draft === true);
  } catch (err) {
    if (err.status === 404) {
      return [];
    }
    throw err;
  }
}

export default getDraftReleases;
