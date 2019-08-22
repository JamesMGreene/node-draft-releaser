import path from 'path';
import verifyRequiredEnv from '../src/verify-required-env';

describe('verifyRequiredEnv', () => {
  afterEach(() => {
    // Environment variables
    delete process.env.GITHUB_EVENT_NAME;
    delete process.env.GITHUB_REF;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_WORKSPACE;

    // Secrets
    delete process.env.GITHUB_TOKEN;
  });

  it('should not throw if all required environment variables and secrets have values', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_REF = 'refs/heads/master';
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    // Secrets
    process.env.GITHUB_TOKEN = 'testToken123';

    expect(verifyRequiredEnv()).toBe(undefined);
  });

  it('should throw if none of the required environment variables or secrets exist', () => {
    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if none of the required environment variables exist', () => {
    // Secrets
    process.env.GITHUB_TOKEN = 'testToken123';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if none of the required secrets exist', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_REF = 'refs/heads/master';
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if all of the required environment variables and secrets are missing values', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = '';
    process.env.GITHUB_REF = '';
    process.env.GITHUB_REPOSITORY = '';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_WORKSPACE = '';

    // Secrets
    process.env.GITHUB_TOKEN = '';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if all of the required environment variables are missing values', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = '';
    process.env.GITHUB_REF = '';
    process.env.GITHUB_REPOSITORY = '';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_WORKSPACE = '';

    // Secrets
    process.env.GITHUB_TOKEN = 'testToken123';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if all of the required secrets are missing values', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_REF = 'refs/heads/master';
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    // Secrets
    process.env.GITHUB_TOKEN = '';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if some of the required environment variables and secrets are missing values', () => {
    // Environment variables
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    // Secrets
    process.env.GITHUB_TOKEN = '';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if some of the required environment variables are missing values', () => {
    // Environment variables
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = '';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    // Secrets
    process.env.GITHUB_TOKEN = 'testToken123';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });

  it('should throw if some of the required environment variables and secrets are missing values', () => {
    // Environment variables
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_REF = 'refs/heads/master';
    process.env.GITHUB_REPOSITORY = 'JamesMGreene/test-repo';
    process.env.GITHUB_SHA = 'deadbeefcafe1c6e148a9be56893bed50abadbed';
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    // Secrets
    process.env.GITHUB_TOKEN = '';

    expect(verifyRequiredEnv).toThrowErrorMatchingSnapshot();
  });
});
