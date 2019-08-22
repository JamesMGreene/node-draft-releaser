"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const requiredEnvVars = [
    'GITHUB_EVENT_NAME',
    'GITHUB_REF',
    'GITHUB_REPOSITORY',
    'GITHUB_SHA',
    'GITHUB_WORKSPACE',
];
const requiredSecrets = ['GITHUB_TOKEN'];
const isEnvVarFalsy = envVar => !(process.env.hasOwnProperty(envVar) && process.env[envVar]);
function verifyRequiredEnv() {
    const requiredButMissingEnvVars = requiredEnvVars.filter(isEnvVarFalsy);
    if (requiredButMissingEnvVars.length > 0) {
        const missingEnvVarsList = requiredButMissingEnvVars.map(key => `- ${key}`).join('\n');
        throw new Error(`The following environment variables are required for this GitHub Action to run:
${missingEnvVarsList}`);
    }
    const requiredButMissingSecrets = requiredSecrets.filter(isEnvVarFalsy);
    if (requiredButMissingSecrets.length > 0) {
        const missingSecretsList = requiredButMissingSecrets.map(key => `- ${key}`).join('\n');
        throw new Error(`The following secrets are required for this GitHub Action to run:
${missingSecretsList}`);
    }
}
exports.default = verifyRequiredEnv;
