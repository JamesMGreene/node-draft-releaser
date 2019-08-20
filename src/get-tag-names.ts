import { context, GitHub } from '@actions/github';
import { ITag } from './types/index';

const VERSION_MATCH = /^[vV]?(\d+.*)|.*$/;

async function getTagNames(): Promise<string[]> {
  try {
    const octokit = new GitHub(process.env.GITHUB_TOKEN as string);

    // Get ALL of the tags for this repository
    const options = octokit.repos.listTags.endpoint.merge({ ...context.repo, per_page: 100 });
    const tags = (await octokit.paginate(options)) as ITag[];

    // Filter down to just the SemVer-like tag names, removing any 'v'/'V' prefixes
    return tags.map(tag => tag.name.replace(VERSION_MATCH, '$1')).filter(Boolean);
  } catch (err) {
    if (err.status === 404) {
      return [];
    }
    throw err;
  }
}

export default getTagNames;
