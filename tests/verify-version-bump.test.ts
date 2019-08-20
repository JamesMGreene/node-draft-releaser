import path from 'path';
import verifyVersionBump from '../src/verify-version-bump';

describe('verifyVersionBump', () => {
  it('should return false if the version matches an existing tag', () => {
    const result = verifyVersionBump('1.0.2', ['1.0.2', '1.0.1', '1.0.0']);
    expect(result).toBe(false);
  });

  it('should return true if the version does not match an existing tag', () => {
    const result = verifyVersionBump('1.0.2', ['1.0.1', '1.0.0']);
    expect(result).toBe(true);
  });
});
