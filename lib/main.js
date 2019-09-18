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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const find_target_draft_release_1 = __importDefault(require("./find-target-draft-release"));
const get_draft_releases_1 = __importDefault(require("./get-draft-releases"));
const get_tag_names_1 = __importDefault(require("./get-tag-names"));
const get_version_1 = __importDefault(require("./get-version"));
const publish_draft_release_1 = __importDefault(require("./publish-draft-release"));
const verify_required_env_1 = __importDefault(require("./verify-required-env"));
const verify_version_bump_1 = __importDefault(require("./verify-version-bump"));
function setNeutralCancellation(message) {
    process.exitCode = 78;
    core.warning(message);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verify all required environment variables and secrets exist, or else throw
            verify_required_env_1.default();
            // Verify the triggering event is a PushEvent
            if (process.env.GITHUB_EVENT_NAME !== 'push') {
                return setNeutralCancellation('This GitHub Action may only be run for "push" events');
            }
            //
            // Get the Action's input values
            //
            const tagMustMatch = core.getInput('allow_unmatched_draft_tag').toLowerCase() === 'false';
            // Get the package version from the current commit
            const version = get_version_1.default();
            if (!version) {
                return setNeutralCancellation('No version is set in "package.json"');
            }
            // Get all existing tag names for the repository
            const tagNames = yield get_tag_names_1.default();
            // Verify the current version does not yet have a corresponding tag in existence
            const isBumping = verify_version_bump_1.default(version, tagNames);
            if (!isBumping) {
                return setNeutralCancellation('No new version was introduced in "package.json"');
            }
            // Get all existing releases that are in a draft status
            const draftReleases = yield get_draft_releases_1.default();
            // Filter down to the most appropriate draft release
            const targetDraft = find_target_draft_release_1.default(draftReleases, tagMustMatch, version);
            if (targetDraft == null) {
                throw new Error('No appropriate Draft Release could be found');
            }
            // Publish that draft release
            const publishedRelease = yield publish_draft_release_1.default(targetDraft, version);
            //
            // Set the Action's output values
            //
            core.setOutput('version', version);
            core.setOutput('release_id', publishedRelease.id.toString());
            core.setOutput('release_url', publishedRelease.html_url);
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
exports.default = main;
