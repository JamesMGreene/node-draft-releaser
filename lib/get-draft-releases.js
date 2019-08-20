"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
function getDraftReleases() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new github_1.GitHub(process.env.GITHUB_TOKEN);
            // Get ALL of the GitHub Releases for this repository
            const options = octokit.repos.listReleases.endpoint.merge(Object.assign({}, github_1.context.repo, { per_page: 100 }));
            const releases = (yield octokit.paginate(options));
            // Filter down to just the Draft Releases
            return releases.filter(release => release.draft === true);
        }
        catch (err) {
            if (err.status === 404) {
                return [];
            }
            throw err;
        }
    });
}
exports.default = getDraftReleases;
