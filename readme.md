# GitHub Actions

*This repository contains several GitHub Actions that help building and deploying other projects.*

## List of Actions

| Action | Description |
|--------|-------------|
| `set-version`| Creates version number in a format *`a.b.c`* from the *`github.context.ref`* and the *`github.context.runNumber`* |
| `ssh-upload`| Uploads artifacts on to the WWW server using SSH protocol

## Definitions

### `set-version`

| Inputs |
|------------------------|
| *This action doesn't take any inputs* |

| Outputs | Description |
|-----------|-------------|
| `build-version`| Build version as a string in a format *`*.*.{runNumber}`*. In order this action to succeed, you must push from a valid branch. So by following git-flow, either you should push to *`releasee/*.*`* or tag master as *`v*.*`* |

### `ssh-upload`

| Inputs | Default | Description |
|-----------|-|-------------|
| `host` | *`localhost`* | Host or IP Address to connect to |
| `ssh-user` * | *None* | Username used for the connection |
| `ssh-key` * | *None* | SSH key string |
| `source-dir` | *`build`* | Source directory that will be uploaded |
| `remote-dir` | *`www`* | Remote directory where all files from *`source-dir`* will be uploaded to |

\* - *Required parameter*

| Outputs |
|---|
| *This action doesn't output anything* |