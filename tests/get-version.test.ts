import path from 'path';
import getVersion from '../src/get-version';

describe('getVersion', () => {
  afterEach(() => {
    delete process.env.GITHUB_WORKSPACE;
  });

  it('should return the version from the "package.json" in the workspace', async () => {
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'fixtures');

    const version = await getVersion();
    expect(version).toBe('1.0.0-beta.2');
  });

  it('should throw if no "package.json" is found in the workspace', () => {
    process.env.GITHUB_WORKSPACE = path.join(__dirname, 'nonexistent-fixtures');

    expect(() => getVersion()).toThrowErrorMatchingSnapshot();
  });
});
