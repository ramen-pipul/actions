# GitHub Actions

This repository contains several GitHub Actions that help building and deploying other projects.

## List of Actions

| Action | Description |
|--------|-------------|
| `set-version`| Creates version number in a format `a.b.c.d` from the `github.context.ref` and the `github.context.runNumber` |
| `ssh-upload`| Uploads artifacts on to the WWW server using SSH protocol

## Definitions

### `set-version`

| Parameter | Default | Description |
|-----------|-|-------------|
| `git-ref` | *`release/1.0`* | **Required** Either tag or branch name from the push that triggered the build. The only supported formats are: *`refs/heads/release/*.*`* and *`refs/tags/v*.*`*, where the *`*.*`* is the version number. |
| `build-number` | *`0`* | Build number from the *`github`* context |

| Output | Description |
|-----------|-------------|
| `build-version`| Build version as a string in a format *`*.*.{runNumber}`* |

### `ssh-upload`

| Parameter | Default | Description |
|-----------|-|-------------|
| `host` | *`localhost`* | **Required** Host or IP Address to connect to |
| `ssh-user` | *None* | Username used for the connection |
| `ssh-key` | *None* | SSH key string |
