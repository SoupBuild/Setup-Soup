import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as thc from "typed-rest-client/HttpClient";
import { IHeaders } from "typed-rest-client/Interfaces";

interface Asset {
  name: string;
  url: string;
}

export interface Release {
  tag_name: string;
  name: string;
  assets: Asset[];
  tarball_url: string;
  zipball_url: string;
}

async function getLatestRelease(): Promise<Release> {
  const headers: IHeaders = {
    Accept: "application/vnd.github.v3+json",
  };

  const GitHubApiUrl = "https://api.github.com";
  const soupRepoPath = "mwasplund/soup";
  const url = `${GitHubApiUrl}/repos/${soupRepoPath}/releases/latest`;

  const httpClient: thc.HttpClient = new thc.HttpClient("github-api");
  const response = await httpClient.get(url, headers);

  if (response.message.statusCode !== 200) {
    throw new Error(`${url} failed: ${response.message.statusCode}`);
  }

  const responseBody = await response.readBody();
  const result: Release = JSON.parse(responseBody.toString());

  return result;
}

async function getTagRelease(tag: string): Promise<Release> {
  const headers: IHeaders = {
    Accept: "application/vnd.github.v3+json",
  };

  const GitHubApiUrl = "https://api.github.com";
  const soupRepoPath = "mwasplund/soup";
  const url = `${GitHubApiUrl}/repos/${soupRepoPath}/releases/tag/${tag}`;

  const httpClient: thc.HttpClient = new thc.HttpClient("github-api");
  const response = await httpClient.get(url, headers);

  if (response.message.statusCode !== 200) {
    throw new Error(`${url} failed: ${response.message.statusCode}`);
  }

  const responseBody = await response.readBody();
  const result: Release = JSON.parse(responseBody.toString());

  return result;
}

export async function run(): Promise<void> {
  try {
    // Load the requested version and attempt to retrieve it from the releases
    const version = core.getInput("version");
    console.log(`Setup Soup Version: ${version}`);
    let activeRelease: Release;
    if (version === "latest") {
      console.log(`Get Latest Release`);
      activeRelease = await getLatestRelease();
    } else {
      console.log(`Get Release for provided tag`);
      activeRelease = await getTagRelease(version);
    }

    console.log(`Using Release: ${activeRelease.name}`);
    const soupAsset = activeRelease.assets.find((asset) => {
      return asset.name == "Soup.zip";
    });
    if (soupAsset === undefined) {
      throw new Error(`Invalid Release: Could not find Soup asset`);
    }

    const assetUrl = soupAsset.url;
    console.log(`Downloading Tool: ${assetUrl}`);
    const soupArchivePath = await tc.downloadTool(assetUrl);

    console.log(`Extracting Archive: ${soupArchivePath}`);
    const soupPath = await tc.extractZip(soupArchivePath, "bin");

    console.log(`soupPath: ${soupPath}`);
    core.addPath(soupPath);
    core.setOutput("soupPath", soupPath);
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}
