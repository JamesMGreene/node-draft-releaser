import path from 'path';
import verifyRequiredSecrets from '../src/verify-required-secrets';

describe('verifyRequiredSecrets', () => {
  afterEach(() => {
    delete process.env.GITHUB_EVENT_NAME;
    delete process.env.GITHUB_REF;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_WORKSPACE;
  });

  it('should not throw if all required secrets have values', () => {
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_REF = 'refs/heads/master';
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
    process.env.GITHUB_TOKEN = 'testToken123';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    expect(verifyRequiredSecrets()).toBe(undefined);
  });

  it('should throw if none of the required secrets exist', () => {
    expect(verifyRequiredSecrets).toThrowErrorMatchingSnapshot();
  });

  it('should throw if all of the required secrets are missing values', () => {
    process.env.GITHUB_EVENT_NAME = '';
    process.env.GITHUB_REF = '';
    process.env.GITHUB_REPOSITORY = '';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_TOKEN = '';
    process.env.GITHUB_WORKSPACE = '';

    expect(verifyRequiredSecrets).toThrowErrorMatchingSnapshot();
  });

  it('should throw if some of the required secrets are missing values', () => {
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_TOKEN = 'testToken123';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    expect(verifyRequiredSecrets).toThrowErrorMatchingSnapshot();
  });
});
