import * as core from '@actions/core';

async function run() {
  try {
    const repoToken = core.getInput('repo_token', { required: true });
    core.debug(`Hello ${repoToken}`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
