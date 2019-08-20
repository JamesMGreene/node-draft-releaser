"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getVersion() {
    const workspace = process.env.GITHUB_WORKSPACE;
    const pathToPackage = path_1.default.join(workspace, 'package.json');
    if (!fs_1.default.existsSync(pathToPackage)) {
        throw new Error('"package.json" could not be found in your project\'s root.');
    }
    const pkg = require(pathToPackage);
    return pkg.version;
}
exports.default = getVersion;
