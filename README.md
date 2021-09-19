# Setup Soup (Javascript Action)
This action prints downloads and registers the specified Soup CLI version for easy building in GitHub builds.

## Inputs

### `version`

**Required** The version of Soup to install

## Outputs

### `soupPath`
The registered path to the Soup executable.

## Example usage
uses: soupbuild/setup-soup@v1
with:
  version: 'latest'