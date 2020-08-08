import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as thc from "typed-rest-client/HttpClient";
import { IHeaders } from "typed-rest-client/Interfaces";

interface Asset {
  name: string;
  url: string;
}

export interface Release {
  name: string;
  assets: Asset[];
  tarball_url: string;
  zipball_url: string;
}

async function getlatestRelease(): Promise<Release> {
  const headers: IHeaders = {
    Accept: "application/vnd.github.v3+json",
  };

  const GitHubApiUrl = "https://api.github.com/repos";
  const soupRepoPath = "mwasplund/soup";
  const url = `${GitHubApiUrl}/${soupRepoPath}/releases/latest`;

  const httpClient: thc.HttpClient = new thc.HttpClient("github-api");
  const response = await httpClient.get(url, headers);

  if (response.message.statusCode !== 200) {
    throw new Error(`${url} failed: ${response.message.statusCode}`);
  }

  const responseBody = await response.readBody();
  const result: Release = JSON.parse(responseBody.toString());
  console.log(`Sion: ${responseBody}`);

  return result;
}

export async function run(): Promise<void> {
  try {
    const version = core.getInput("version");
    if (version === "latest") {
      const latestRelease = await getlatestRelease();
      console.log(latestRelease);
    }

    // Load the requested version and attempt to retrieve it from the releases
    console.log(`Setup Soup Version: ${version}`);

    const url = `https://github.com/mwasplund/Soup/releases/download/${version}/Soup.zip`;
    console.log(`Downloading Tool: ${url}`);
    const soupArchivePath = await tc.downloadTool(url);

    console.log(`Extracting Archive: ${soupArchivePath}`);
    const soupPath = await tc.extractZip(soupArchivePath, "bin");

    console.log(`soupPath: ${soupPath}`);
    core.addPath(soupPath);
    core.setOutput("soupPath", soupPath);
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}
