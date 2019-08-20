import fs from 'fs';
import path from 'path';

function getVersion(): string {
  const workspace = process.env.GITHUB_WORKSPACE as string;
  const pathToPackage = path.join(workspace, 'package.json');
  if (!fs.existsSync(pathToPackage)) {
    throw new Error('"package.json" could not be found in your project\'s root.');
  }
  const pkg = require(pathToPackage);
  return pkg.version;
}

export default getVersion;
