import nock from 'nock';
import publishDraftRelease from '../src/publish-draft-release';
import { IRelease } from '../src/types/index';

const owner = 'JamesMGreene';
const repo = 'test-repo';

let releaseIdCounter = 0;
function generateDraftRelease (version: string, name: string = version): IRelease {
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
    name,
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
  const prereleaseVersion = '2.0.0-beta.1';

  const someDraftRelease = generateDraftRelease(someVersion);
  const someDraftReleaseWithLesserVersionName = generateDraftRelease(someVersion, prereleaseVersion);
  const someDraftReleaseWithGreaterVersionName = generateDraftRelease(someVersion, '3.0.0');
  const someDraftReleaseWithNonVersionName = generateDraftRelease(someVersion, 'The Big One!');

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
    it('should update as expected', async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply(200, (uri, requestBody) => ({
            ...someDraftRelease,
            ...requestBody as object,
            published_at: '2019-08-19T03:34:57Z'
          }));

      const release = await publishDraftRelease(someDraftRelease, someVersion, true);
      expect(release).toMatchSnapshot();
      expect(release.name).toBe(someVersion);
      expect(release.name).toBe(someDraftRelease.name);
    });

    describe('with allowNameUpdate:true', () => {
      it('should update the release name if it is a lesser version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithLesserVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithLesserVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithLesserVersionName, someVersion, true);
        expect(release).toMatchSnapshot();
        expect(release.name).toBe(someVersion);
        expect(release.name).not.toBe(someDraftReleaseWithLesserVersionName.name);
      });

      it('should update the release name if it is a greater version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithGreaterVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithGreaterVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithGreaterVersionName, someVersion, true);
        expect(release).toMatchSnapshot();
        expect(release.name).toBe(someVersion);
        expect(release.name).not.toBe(someDraftReleaseWithGreaterVersionName.name);
      });

      it('should not update the release name if it is not a version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithNonVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithNonVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithNonVersionName, someVersion, true);
        expect(release).toMatchSnapshot();
        expect(release.name).not.toBe(someVersion);
        expect(release.name).toBe(someDraftReleaseWithNonVersionName.name);
      });
    });

    describe('with allowNameUpdate:false', () => {
      it('should not update the release name if it is a lesser version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithLesserVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithLesserVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithLesserVersionName, someVersion, false);
        expect(release).toMatchSnapshot();
        expect(release.name).not.toBe(someVersion);
        expect(release.name).toBe(someDraftReleaseWithLesserVersionName.name);
      });

      it('should not update the release name if it is a greater version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithGreaterVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithGreaterVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithGreaterVersionName, someVersion, false);
        expect(release).toMatchSnapshot();
        expect(release.name).not.toBe(someVersion);
        expect(release.name).toBe(someDraftReleaseWithGreaterVersionName.name);
      });

      it('should not update the release name if it is not a version', async () => {
        nock('https://api.github.com')
          .patch(`/repos/${owner}/${repo}/releases/${someDraftReleaseWithNonVersionName.id}`)
            .reply(200, (uri, requestBody) => ({
              ...someDraftReleaseWithNonVersionName,
              ...requestBody as object,
              published_at: '2019-08-19T03:34:57Z'
            }));

        const release = await publishDraftRelease(someDraftReleaseWithNonVersionName, someVersion, false);
        expect(release).toMatchSnapshot();
        expect(release.name).not.toBe(someVersion);
        expect(release.name).toBe(someDraftReleaseWithNonVersionName.name);
      });
    });
  });

  describe('draft published as prerelease', () => {
    it('should update as expected', async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${draftPrerelease.id}`)
          .reply(200, (uri, requestBody) => ({
            ...draftPrerelease,
            ...requestBody as object,
            published_at: '2019-08-19T03:34:57Z'
          }));

      const prerelease = await publishDraftRelease(draftPrerelease, prereleaseVersion, true);
      expect(prerelease).toMatchSnapshot();
      expect(prerelease.name).toBe(draftPrerelease.name);
    });
  });

  describe('not found error', () => {
    it('should throw', async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply(404);

      await expect(publishDraftRelease(someDraftRelease, someVersion, true)).rejects.toThrowError();
    });
  });

  describe('other error', () => {
    it('should throw', async () => {
      nock('https://api.github.com')
        .patch(`/repos/${owner}/${repo}/releases/${someDraftRelease.id}`)
          .reply(401);

      await expect(publishDraftRelease(someDraftRelease, someVersion, true)).rejects.toThrowError();
    });
  });
});
