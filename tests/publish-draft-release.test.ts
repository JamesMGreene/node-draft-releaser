import nock from 'nock';
import publishDraftRelease from '../src/publish-draft-release';
import { IRelease } from '../src/types/index';

const owner = 'JamesMGreene';
const repo = 'test-repo';

let releaseIdCounter = 0;
function generateDraftRelease (version: string): IRelease {
  const releaseId = ++releaseIdCounter;
  return {
    assets: [],
    assets_url: `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets`,
    author: {
      id: 417751,
      login: owner
    },
    body: 'Blah',
    created_at: '2019-08-18T03:34:57Z',
    draft: true,
    html_url: `https://github.com/${owner}/${repo}/releases/tag/untagged-29db7ff348b9db3f003e`,
    id: releaseId,
    name: version,
    prerelease: false,
    published_at: null,
    tag_name: version,
    tarball_url: null,
    target_commitish: 'master',
    upload_url: `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets{?name,label}`,
    url: `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}`,
    zipball_url: null
  };
}

describe('publishDraftRelease', () => {
  const someVersion = '2.0.0';
  const someDraftRelease = generateDraftRelease(someVersion);

  const prereleaseVersion = '2.0.0-beta.1';
  const draftPrerelease = generateDraftRelease(prereleaseVersion);

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'testToken123';

    // To enable: `import { context } from '@actions/github'`
    process.env.GITHUB_REPOSITORY = `${owner}/${repo}`;

    // For creating the Release and Tag from the pushed commit SHA
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
  });

  afterEach(() => {
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_TOKEN;
  });

  describe('draft published as normal release', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply((uri, requestBody) => {
            return [
              200,
              {
                ...someDraftRelease,
                ...JSON.parse(requestBody as string),
                published_at: '2019-08-19T03:34:57Z'
              }
            ];
          });
    });

    it('should update as expected', async () => {
      const release = await publishDraftRelease(someDraftRelease, someVersion);
      expect(release).toMatchSnapshot();
    });
  });

  describe('draft published as prerelease', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${draftPrerelease.id}`)
          .reply((uri, requestBody) => {
            return [
              200,
              {
                ...draftPrerelease,
                ...JSON.parse(requestBody as string),
                published_at: '2019-08-19T03:34:57Z'
              }
            ];
          });
    });

    it('should update as expected', async () => {
      const prerelease = await publishDraftRelease(draftPrerelease, prereleaseVersion);
      expect(prerelease).toMatchSnapshot();
    });
  });

  describe('not found error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply(404);
    });

    it('should throw', async () => {
      await expect(publishDraftRelease(someDraftRelease, someVersion)).rejects.toThrowError();
    });
  });

  describe('other error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply(401);
    });

    it('should throw', async () => {
      await expect(publishDraftRelease(someDraftRelease, someVersion)).rejects.toThrowError();
    });
  });
});
