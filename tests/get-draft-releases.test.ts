import nock from 'nock';
import getDraftReleases from '../src/get-draft-releases';
import { IRelease } from '../src/types/index';

const owner = 'JamesMGreene';
const repo = 'test-repo';

let releaseIdCounter = 0;
function generateRelease (version: string, isDraft: boolean): IRelease {
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
    draft: isDraft,
    html_url: `https://github.com/${owner}/${repo}/releases/tag/untagged-29db7ff348b9db3f003e`,
    id: releaseId,
    name: version,
    prerelease: false,
    published_at: isDraft ? null : '2019-08-18T03:34:57Z',
    tag_name: version,
    tarball_url: null,
    target_commitish: 'master',
    upload_url: `https://uploads.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets{?name,label}`,
    url: `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}`,
    zipball_url: null
  };
}

describe('getDraftReleases', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'testToken123';

    // To enable: `import { context } from '@actions/github'`
    process.env.GITHUB_REPOSITORY = `${owner}/${repo}`;
  });

  afterEach(() => {
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_TOKEN;
  });

  describe('single page', () => {
    const releases = [
      ['vNext', true],
      ['2.0.0', true],
      ['v1.1.0', false],
      ['V1.0.2', false],
      ['1.0.1', false],
      ['1.0.0', false],
      ['1.0.0-beta.1', false],
      ['0.9', false],
      ['0', false]
    ].map(([version, isDraft]: Array<string | boolean>) => generateRelease(version as string, isDraft as boolean));

    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/releases?per_page=100`)
          .reply(200, releases);
    });

    it('should return only the draft releases', async () => {
      const draftReleases = await getDraftReleases();
      expect(draftReleases).toEqual(releases.slice(0, 2));
    });
  });

  describe('multiple pages', () => {
    const releases = [
      generateRelease('vNext', true),
      generateRelease('2.0.0', true),
      generateRelease('v1.1.0', false),
    ];

    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/releases?per_page=100`)
          .reply((uri) => {
            return [
              200,
              releases.slice(0, 1),
              {
                Link: `<${uri}&page=2>; rel="next",<${uri}&page=3>; rel="last"`
              }
            ]
          })
        .get(`/repos/${owner}/${repo}/releases?per_page=100&page=2`)
          .reply((uri) => {
            const baseUrl = uri.replace(/&.*$/, '');
            return [
              200,
              releases.slice(1, 2),
              {
                Link: `<${baseUrl}&page=1>; rel="prev",<${baseUrl}&page=1>; rel="first",<${baseUrl}&page=3>; rel="next",<${baseUrl}&page=3>; rel="last"`
              }
            ]
          })
        .get(`/repos/${owner}/${repo}/releases?per_page=100&page=3`)
          .reply((uri) => {
            const baseUrl = uri.replace(/&.*$/, '');
            return [
              200,
              releases.slice(2, 3),
              {
                Link: `<${baseUrl}&page=2>; rel="prev",<${baseUrl}&page=1>; rel="first"`
              }
            ]
          });
    });

    it('should return only the draft releases', async () => {
      const draftReleases = await getDraftReleases();
      expect(draftReleases).toEqual(releases.slice(0, 2));
    });
  });

  describe('not found error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/releases?per_page=100`).reply(404);
    });

    it('should return an empty array', async () => {
      const draftReleases = await getDraftReleases();
      expect(draftReleases).toEqual([]);
    });
  });

  describe('other error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/releases?per_page=100`).reply(401);
    });

    it('should throw', async () => {
      await expect(getDraftReleases()).rejects.toThrowError();
    });
  });
});
