import nock from 'nock';
import getTagNames from '../src/get-tag-names';
import { ITag } from '../src/types/index'

const owner = 'JamesMGreene';
const repo = 'test-repo';

function generateTag (version: string): ITag {
  return {
    commit: {
      sha: 'c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc',
      url: `https://api.github.com/repos/${owner}/${repo}/commits/c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc`
    },
    name: version,
    tarball_url: `https://github.com/${owner}/${repo}/tarball/${version}`,
    zipball_url: `https://github.com/${owner}/${repo}/zipball/${version}`
  }
}

describe('getTagNames', () => {
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
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/tags?per_page=100`)
          .reply(
            200,
            [
              'vNext',
              'v2.0.0',
              'V1.1.0',
              '1.0.2',
              '1.0.1',
              '1.0.0',
              '1.0.0-beta.1',
              '0.9',
              '0'
            ].map(generateTag)
          );
    });

    it('should return only the tag names', async () => {
      const tagNames = await getTagNames();
      expect(tagNames).toEqual([
        '2.0.0',
        '1.1.0',
        '1.0.2',
        '1.0.1',
        '1.0.0',
        '1.0.0-beta.1',
        '0.9',
        '0'
      ]);
    });
  });

  describe('multiple pages', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/tags?per_page=100`)
          .reply((uri) => {
            return [
              200,
              ['vNext', 'v2.0.0', 'V1.1.0'].map(generateTag),
              {
                Link: `<${uri}&page=2>; rel="next",<${uri}&page=3>; rel="last"`
              }
            ]
          })
        .get(`/repos/${owner}/${repo}/tags?per_page=100&page=2`)
          .reply((uri) => {
            const baseUrl = uri.replace(/&.*$/, '');
            return [
              200,
              ['1.0.2', '1.0.1', '1.0.0'].map(generateTag),
              {
                Link: `<${baseUrl}&page=1>; rel="prev",<${baseUrl}&page=1>; rel="first",<${baseUrl}&page=3>; rel="next",<${baseUrl}&page=3>; rel="last"`
              }
            ]
          })
        .get(`/repos/${owner}/${repo}/tags?per_page=100&page=3`)
          .reply((uri) => {
            const baseUrl = uri.replace(/&.*$/, '');
            return [
              200,
              ['1.0.0-beta.1', '0.9', '0'].map(generateTag),
              {
                Link: `<${baseUrl}&page=2>; rel="prev",<${baseUrl}&page=1>; rel="first"`
              }
            ]
          });
    });

    it('should return only the tag names', async () => {
      const tagNames = await getTagNames();
      expect(tagNames).toEqual([
        '2.0.0',
        '1.1.0',
        '1.0.2',
        '1.0.1',
        '1.0.0',
        '1.0.0-beta.1',
        '0.9',
        '0'
      ]);
    });
  });

  describe('not found error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/tags?per_page=100`).reply(404);
    });

    it('should return an empty array', async () => {
      const tagNames = await getTagNames();
      expect(tagNames).toEqual([]);
    });
  });

  describe('other error', () => {
    beforeEach(async () => {
      nock('https://api.github.com')
        .get(`/repos/${owner}/${repo}/tags?per_page=100`).reply(401);
    });

    it('should throw', async () => {
      await expect(getTagNames()).rejects.toThrowError();
    });
  });
});
