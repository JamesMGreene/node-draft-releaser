"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function findTargetDraftRelease(draftReleases, tagMustMatch, version) {
    let targetRelease = null;
    let defaultRelease = null;
    const pushedBranch = process.env.GITHUB_REF;
    const pushedCommitish = pushedBranch.replace(/^refs\/heads\//, '');
    for (const draftRelease of draftReleases) {
        if (draftRelease.target_commitish === pushedCommitish) {
            defaultRelease = draftRelease;
            if (version === draftRelease.tag_name) {
                targetRelease = draftRelease;
                break;
            }
        }
    }
    if (!tagMustMatch && targetRelease === null && defaultRelease !== null) {
        targetRelease = defaultRelease;
    }
    return targetRelease;
}
exports.default = findTargetDraftRelease;
