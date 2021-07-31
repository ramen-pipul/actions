# extract-version javascript action

This action extracts version number from the release branch/tag name.

## Inputs

## `git-ref`

**Required** The name of the person to greet. Default `"release/1.0"`.

## Outputs

## `build-version`

The version number in a format `"a.b.c"`.

## Example usage

uses: ramen-pipul/actions/extract-version@v1.1
with:
  build-number: ${{buildNumber}}
  git-ref: ${{gitRef}}