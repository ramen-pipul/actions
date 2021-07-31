const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `build-version` input defined in action metadata file
  const buildNumber = core.getInput('build-number');
  const gitRef = core.getInput('git-ref');
  console.log(`Build: ${buildNumber}, Ref: ${gitRef}`);

  const buildVersion = `1.0.${buildNumber}`

  core.setOutput("build-version", buildVersion);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}