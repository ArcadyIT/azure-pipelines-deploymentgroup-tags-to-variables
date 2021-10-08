import tl = require('azure-pipelines-task-lib/task');
import { Guid } from './utils';

async function run() {
  try {
    // Validate the variable name to set in the release has been passed in
    const inputDevOpsReleaseVariableName: string | undefined = tl.getInput('variablename', true);
    if (inputDevOpsReleaseVariableName == 'bad' || inputDevOpsReleaseVariableName == null) {
      tl.setResult(tl.TaskResult.Failed, 'Bad Variable Name input was given');
      return;
    }

    tl.logDetail(Guid.New().ToString(), 'Starting deployment-group-tags-to-variables step');
    await runPipelineStep(inputDevOpsReleaseVariableName);
    tl.logDetail(Guid.New().ToString(), 'Successfully completed deployment-group-tags-to-variables!');
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

async function runPipelineStep(inputDevOpsReleaseVariableName: string) {
  // Get environment variables
  const varSysAccessToken = tl.getVariable('SYSTEM_ACCESSTOKEN');
  const varSysTfsCollectionUri = tl.getVariable('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');
  const varSysTeamProject = tl.getVariable('SYSTEM_TEAMPROJECT');
  const varReleaseId = tl.getVariable('RELEASE_RELEASEID');
  const varAgentDeploymentGroupId = process.env.AGENT_DEPLOYMENTGROUPID;
  const varAgentId = process.env.AGENT_ID;

  let currentReleaseJson = null;
  let currentAgentJson = null;
  const getRequestHeaders = (method: string) =>
    ({
      method,
      headers: {
        Authorization: `Bearer ${varSysAccessToken}`,
      },
    } as RequestInit);

  // Fetch the current release
  try {
    tl.debug(`Fetching current release information for release id ${varReleaseId}`);
    const currentReleaseRequest = await fetch(
      `${varSysTfsCollectionUri}${varSysTeamProject}/_apis/Release/releases/${varReleaseId}?api-version=6.0-preview.8`,
      getRequestHeaders('GET')
    );
    currentReleaseJson = await currentReleaseRequest.json();
    tl.debug(`Successfully fetched release information: ${JSON.stringify(currentReleaseJson, null, 4)}`);
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, `Failed to fetch current release: ${err.message}`);
    return;
  }

  // Fetch the current agent information
  try {
    tl.debug(`Fetching agent information for agent id ${varAgentId}`);
    const currentAgentRequest = await fetch(
      `${varSysTfsCollectionUri}${varSysTeamProject}/_apis/distributedtask/deploymentgroups/${varAgentDeploymentGroupId}/targets?targetId=${varAgentId}`,
      getRequestHeaders('GET')
    );
    currentAgentJson = await currentAgentRequest.json();
    tl.debug(`Successfully fetched agent information: ${JSON.stringify(currentAgentJson, null, 4)}`);
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, `Failed to fetch current agent: ${err.message}`);
    return;
  }

  // Read the tags from the current deployment group agent
  const currentAgentTags = currentAgentJson.agent.name as string[];
  const formattedAgentTags = currentAgentTags.join(',');
  tl.logDetail(Guid.New().ToString(), `Current agent tags: ${formattedAgentTags}`);

  // Overwrite the release variable specified by the user with the current agent tags
  const currentReleaseVariable = currentReleaseJson.variables[inputDevOpsReleaseVariableName];
  if (currentReleaseVariable != null) {
    currentReleaseVariable.value = formattedAgentTags;
  } else {
    currentReleaseJson.variables[inputDevOpsReleaseVariableName] = { value: formattedAgentTags };
  }

  // Send back the currentReleaseJson object to the Azure DevOps API
  try {
    tl.debug(`Sending updated release information to Azure DevOps: ${JSON.stringify(currentReleaseJson, null, 4)}`);
    const updateReleaseRequest = await fetch(
      `${varSysTfsCollectionUri}${varSysTeamProject}/_apis/Release/releases/${varReleaseId}?api-version=6.0-preview.8`,
      getRequestHeaders('PUT')
    );
    await updateReleaseRequest.json();
    tl.debug(`Successfully updated release information`);
  } catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, `Failed to update release: ${err.message}`);
    return;
  }
}

run();
