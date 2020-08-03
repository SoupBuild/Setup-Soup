import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  // Load the requested version and attempt to retrieve it from the releases
  const version = core.getInput("version");
  console.log(`Setup Soup Version: ${version}`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
