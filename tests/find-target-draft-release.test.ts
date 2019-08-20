import findTargetDraftRelease from '../src/find-target-draft-release';
import { IRelease } from '../src/types/index'

const owner = 'JamesMGreene';
const repo = 'test-repo';
const nonMatchingVersion = '5.3.1';

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

describe('findTargetDraftRelease', () => {
  const taggedDraftReleases = [
    generateDraftRelease('vNext'),
    generateDraftRelease('1.1.0'),
    generateDraftRelease('1.0.1')
  ];
  taggedDraftReleases[0].target_commitish = 'vNext';

  const untaggedDraftReleases = [
    generateDraftRelease('vNext'),
    generateDraftRelease('1.1.0'),
    generateDraftRelease('1.0.1')
  ];
  untaggedDraftReleases[0].target_commitish = 'vNext';
  untaggedDraftReleases[0].tag_name = 'untagged-beefcafe-123';
  untaggedDraftReleases[1].tag_name = 'untagged-deadbeef-456';
  untaggedDraftReleases[2].tag_name = 'untagged-adeadbed-789';

  beforeEach(() => {
    process.env.GITHUB_REF = 'refs/heads/master';
  });

  afterEach(() => {
    delete process.env.GITHUB_REF;
  });

  describe('without any draft releases', () => {
    it('should return null with tagMustMatch as false', () => {
      expect(findTargetDraftRelease([], false, '1.1.0')).toBe(null);
    });

    it('should return null with tagMustMatch as true', () => {
      expect(findTargetDraftRelease([], true, '1.1.0')).toBe(null);
    });
  });

  describe('with draft releases', () => {
    describe('with tagMustMatch as true', () => {
      describe('with a matching version', () => {
        describe('with a matching "master" target_commitish', () => {
          it('should return the matching version if it is the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, true, taggedDraftReleases[taggedDraftReleases.length - 1].tag_name)
            ).toEqual(taggedDraftReleases[taggedDraftReleases.length - 1]);
          });

          it('should return the matching version even if it is not the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, true, taggedDraftReleases[1].tag_name)
            ).toEqual(taggedDraftReleases[1]);
          });
        });

        describe('with a matching non-"master" target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/vNext';
          });

          it('should return the matching version if it is the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases.slice(0, 1), true, taggedDraftReleases[0].tag_name)
            ).toEqual(taggedDraftReleases[0]);
          });

          it('should return the matching version even if it is not the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, true, taggedDraftReleases[0].tag_name)
            ).toEqual(taggedDraftReleases[0]);
          });
        });

        describe('without a matching target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/develop';
          });

          it('should return null', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, true, taggedDraftReleases[0].tag_name)
            ).toBe(null);
          });
        });
      });

      describe('without a matching version', () => {
        describe('with a matching "master" target_commitish', () => {
          it('should return null', () => {
            expect(findTargetDraftRelease(taggedDraftReleases, true, nonMatchingVersion)).toBe(null);
          });
        });

        describe('with a matching non-"master" target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/vNext';
          });

          it('should return null', () => {
            expect(findTargetDraftRelease(taggedDraftReleases, true, nonMatchingVersion)).toBe(null);
          });
        });

        describe('without a matching target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/develop';
          });

          it('should return null', () => {
            expect(findTargetDraftRelease(taggedDraftReleases, true, nonMatchingVersion)).toBe(null);
          });
        });
      });
    });

    describe('with tagMustMatch as false', () => {
      describe('with a matching version', () => {
        describe('with a matching "master" target_commitish', () => {
          it('should return the matching version if it is the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, false, taggedDraftReleases[taggedDraftReleases.length - 1].tag_name)
            ).toEqual(taggedDraftReleases[taggedDraftReleases.length - 1]);
          });

          it('should return the matching version even if it is not the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, false, taggedDraftReleases[1].tag_name)
            ).toEqual(taggedDraftReleases[1]);
          });
        });

        describe('with a matching non-"master" target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/vNext';
          });

          it('should return the matching version if it is the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases.slice(0, 1), false, taggedDraftReleases[0].tag_name)
            ).toEqual(taggedDraftReleases[0]);
          });

          it('should return the matching version even if it is not the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, false, taggedDraftReleases[0].tag_name)
            ).toEqual(taggedDraftReleases[0]);
          });

        });

        describe('without a matching target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/develop';
          });

          it('should return null', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, false, taggedDraftReleases[0].tag_name)
            ).toBe(null);
          });
        });
      });

      describe('without a matching version', () => {
        describe('with a matching "master" target_commitish', () => {
          it('should return the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(untaggedDraftReleases, false, nonMatchingVersion)
            ).toEqual(untaggedDraftReleases[untaggedDraftReleases.length - 1]);
          });
        });

        describe('with a matching non-"master" target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/vNext';
          });

          it('should return the oldest created draft release', () => {
            expect(
              findTargetDraftRelease(untaggedDraftReleases, false, nonMatchingVersion)
            ).toEqual(untaggedDraftReleases[0]);
          });
        });

        describe('without a matching target_commitish', () => {
          beforeEach(() => {
            process.env.GITHUB_REF = 'refs/heads/develop';
          });

          it('should return null', () => {
            expect(
              findTargetDraftRelease(taggedDraftReleases, false, nonMatchingVersion)
            ).toBe(null);
          });
        });
      });
    });
  });
});
