"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
const semver_1 = __importDefault(require("semver"));
function publishDraftRelease(draftRelease, version, allowNameUpdate) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github_1.GitHub(process.env.GITHUB_TOKEN);
        const prereleaseParts = semver_1.default.prerelease(version);
        const isPrerelease = Array.isArray(prereleaseParts) && prereleaseParts.length > 0;
        const draftReleaseNameIsVersion = draftRelease.name && semver_1.default.valid(draftRelease.name);
        const shouldUpdateReleaseName = !draftRelease.name || (allowNameUpdate && draftReleaseNameIsVersion);
        // Publish the release by marking it as a non-draft
        // IMPORTANT: This will also create the associated tag from the
        // current Commit SHA from this "push" event!
        const { data: publishedRelease } = yield octokit.repos.updateRelease(Object.assign(Object.assign({}, github_1.context.repo), { draft: false, name: shouldUpdateReleaseName ? version : draftRelease.name, prerelease: isPrerelease, release_id: draftRelease.id, tag_name: version, target_commitish: process.env.GITHUB_SHA }));
        return publishedRelease;
    });
}
exports.default = publishDraftRelease;
