# GitHub Actions

This repository contains several GitHub Actions that help building and deploying other projects.

## List of Actions

| Action | Description |
|--------|-------------|
| `extract-version`| Creates version number in a format `a.b.c.d` from the `git-ref` and the build number |
| `ssh-upload`| Uploads artifacts on to the WWW server using SSH protocol

## Definitions

### `extract-version`

| Parameter | Default | Description |
|-----------|-|-------------|
| `git-ref` | *`release/1.0`* | **Required** Either tag or branch name from the push that triggered the build |
| `build-number` | *`0`* | Build number from the `github` context |

| Output | Description |
|-----------|-------------|
| `build-version`| Build version as a string in a format `a.b.c.d` |

### `ssh-upload`

| Parameter | Default | Description |
|-----------|-|-------------|
| `host` | *`localhost`* | **Required** Host or IP Address to connect to |
| `ssh-user` | *None* | Username used for the connection |
| `ssh-key` | *None* | SSH key string |
