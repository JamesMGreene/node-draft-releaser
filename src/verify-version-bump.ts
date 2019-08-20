function verifyVersionBump(version: string, tagNames: string[]): boolean {
  for (const tagName of tagNames) {
    if (version === tagName) {
      return false;
    }
  }

  return true;
}

export default verifyVersionBump;
