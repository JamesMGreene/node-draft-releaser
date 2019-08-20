"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requiredSecrets = [
    'GITHUB_EVENT_NAME',
    'GITHUB_REF',
    'GITHUB_REPOSITORY',
    'GITHUB_SHA',
    'GITHUB_TOKEN',
    'GITHUB_WORKSPACE',
];
function verifyRequiredSecrets() {
    const requiredButMissing = requiredSecrets.filter(secret => !(process.env.hasOwnProperty(secret) && process.env[secret]));
    if (requiredButMissing.length > 0) {
        const missingList = requiredButMissing.map(key => `- ${key}`).join('\n');
        throw new Error(`The following secrets are required for this GitHub Action to run:
${missingList}`);
    }
}
exports.default = verifyRequiredSecrets;
