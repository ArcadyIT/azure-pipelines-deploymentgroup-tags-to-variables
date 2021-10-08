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
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate the variable name to set in the release has been passed in
            const inputDevOpsReleaseVariableName = tl.getInput('variablename', true);
            if (inputDevOpsReleaseVariableName == 'bad' || inputDevOpsReleaseVariableName == null) {
                tl.setResult(tl.TaskResult.Failed, 'Bad Variable Name input was given');
                return;
            }
            tl.logDetail(utils_1.Guid.New().ToString(), 'Starting deployment-group-tags-to-variables step');
            yield runPipelineStep(inputDevOpsReleaseVariableName);
            tl.logDetail(utils_1.Guid.New().ToString(), 'Successfully completed deployment-group-tags-to-variables!');
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
function runPipelineStep(inputDevOpsReleaseVariableName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get environment variables
        const varSysAccessToken = tl.getVariable('SYSTEM_ACCESSTOKEN');
        const varSysTfsCollectionUri = tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');
        const varSysTeamProject = tl.getVariable('SYSTEM_TEAMPROJECT');
        const varReleaseId = tl.getVariable('RELEASE_RELEASEID');
        const varAgentDeploymentGroupId = process.env.AGENT_DEPLOYMENTGROUPID;
        const varAgentId = process.env.AGENT_ID;
        let currentReleaseJson = null;
        let currentAgentJson = null;
        const getRequestHeaders = (method) => ({
            method,
            headers: {
                Authorization: `Bearer ${varSysAccessToken}`,
            },
        });
        // Fetch the current release
        try {
            tl.debug(`Fetching current release information for release id ${varReleaseId}`);
            const currentReleaseRequest = yield fetch(`${varSysTfsCollectionUri}${varSysTeamProject}/_apis/Release/releases/${varReleaseId}?api-version=6.0-preview.8`, getRequestHeaders('GET'));
            currentReleaseJson = yield currentReleaseRequest.json();
            tl.debug(`Successfully fetched release information: ${JSON.stringify(currentReleaseJson, null, 4)}`);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, `Failed to fetch current release: ${err.message}`);
            return;
        }
        // Fetch the current agent information
        try {
            tl.debug(`Fetching agent information for agent id ${varAgentId}`);
            const currentAgentRequest = yield fetch(`${varSysTfsCollectionUri}${varSysTeamProject}/_apis/distributedtask/deploymentgroups/${varAgentDeploymentGroupId}/targets?targetId=${varAgentId}`, getRequestHeaders('GET'));
            currentAgentJson = yield currentAgentRequest.json();
            tl.debug(`Successfully fetched agent information: ${JSON.stringify(currentAgentJson, null, 4)}`);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, `Failed to fetch current agent: ${err.message}`);
            return;
        }
        // Read the tags from the current deployment group agent
        const currentAgentTags = currentAgentJson.agent.name;
        const formattedAgentTags = currentAgentTags.join(',');
        tl.logDetail(utils_1.Guid.New().ToString(), `Current agent tags: ${formattedAgentTags}`);
        // Overwrite the release variable specified by the user with the current agent tags
        const currentReleaseVariable = currentReleaseJson.variables[inputDevOpsReleaseVariableName];
        if (currentReleaseVariable != null) {
            currentReleaseVariable.value = formattedAgentTags;
        }
        else {
            currentReleaseJson.variables[inputDevOpsReleaseVariableName] = { value: formattedAgentTags };
        }
        // Send back the currentReleaseJson object to the Azure DevOps API
        try {
            tl.debug(`Sending updated release information to Azure DevOps: ${JSON.stringify(currentReleaseJson, null, 4)}`);
            const updateReleaseRequest = yield fetch(`${varSysTfsCollectionUri}${varSysTeamProject}/_apis/Release/releases/${varReleaseId}?api-version=6.0-preview.8`, getRequestHeaders('PUT'));
            yield updateReleaseRequest.json();
            tl.debug(`Successfully updated release information`);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, `Failed to update release: ${err.message}`);
            return;
        }
    });
}
run();
