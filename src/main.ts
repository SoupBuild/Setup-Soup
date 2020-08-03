import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

export async function run(): Promise<void> {
  try {
    // Load the requested version and attempt to retrieve it from the releases
    const version = core.getInput("version");
    console.log(`Setup Soup Version: ${version}`);

    const url = `https://github.com/mwasplund/Soup/releases/download/${version}/Soup.zip`;
    console.log(`Downloading Tool: ${url}`);
    const soupArchivePath = await tc.downloadTool(url);

    console.log(`Extracting Archive: ${soupArchivePath}`);
    const soupPath = await tc.extractZip(soupArchivePath, "bin");

    console.log(`soupPath: ${soupPath}`);
    core.setOutput("soupPath", soupPath);
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}
