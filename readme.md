# GitHub Actions

*This repository contains several GitHub Actions that help building and deploying other projects.*

Current version: *`1.0`*

Use with tag *`v1`* - `ramen-pipul/actions/{action}@v1` to pull the current version.

## List of Actions

| Action | Description |
|--------|-------------|
| `archive` | Creates a compressed archive (tar.gz) using tar command |
| `ftp-upload` | Uploads artifacts on the WWW server using FTP protocol |
| `ssh-upload`| Uploads files/directory on the WWW server using SSH protocol |
| `set-version` | Creates version number in a format *`a.b.c`* from the *`github.context.ref`* and the *`github.context.runNumber`* |
| `read-props` | Reads properties of a JSON file and sets them as action output |
| `notify-slack` | Sends Slack notification using the predefined message. |

## Definitions

### `archive`

| Inputs | Default | Description |
|---|---|---|
| `base-dir` | *`github.workspace`* | Base directory for the files (and wildcards) to be included in the archive. This directory will be relative to the *`github.workspace`*. |
| `wildcards` | *`**/*`* | List of wildcards to use to filter the files. Each wildcard should be in a separate line. See example for more info |
| `out-path` * | *None* | Path to the output archive |

\* - *Required parameter*

*Example*

```yml
    steps:
      - name: Archive app
        uses: ramen-pipul/actions/archive@v1
        with:
          base-dir: ./AppOutput
          wildcards: |
            wwwroot/**/*
            *.json
            bin/*.dll
          out-path: ./build/my-archive.tar.gz
```

### `ftp-upload`

| Inputs | Default | Description |
|---|---|---|
| `host` | *`localhost`* | FTP server address |
| `ftp-user` * | *None* | FTP Username |
| `ftp-password` * | *None* | FTP Password |
| `remote-dir` | *`www`* | Remote directory for the upload |
| `source-dir` | *`build`* | Source directory that will be uploaded |

\* - *Required parameter*

*Example*

```yml
    steps:
      - name: FTP Upload
        uses: ramen-pipul/actions/ftp-upload@v1
        with:
          host: ftp.server.com
          ftp-user: ${{secrets.ftp-user}}
          ftp-password: ${{secrets.ftp-password}}
          source-dir: build
          remote-dir: www/public_html
```

### `ssh-upload`

| Inputs | Default | Description |
|-----------|-|-------------|
| `host` | *`localhost`* | Host or IP Address to connect to |
| `ssh-user` * | *None* | Username used for the connection |
| `ssh-key` * | *None* | SSH key string |
| `source-dir` | *`build`* | Source directory that will be uploaded |
| `remote-dir` | *`www`* | Remote directory where all files from *`source-dir`* will be uploaded to |

\* - *Required parameter*

*Example*

```yml
    steps:
      - name: SSH Upload
        uses: ramen-pipul/actions/ssh-upload@v1
        with:
          host: ssh.server.com
          ssh-user: ${{secrets.ssh-user}}
          ssh-key: ${{secrets.ssh-key}}
          source-dir: build
          remote-dir: www/public_html
```

### `set-version`

| Inputs | Default | Description |
|--------|---------|-------|
| `inject-version` | *`false`* | Set path to the json file where you want to inject the version into. See example for more information on the JSON format. |

| Outputs | Description |
|-----------|-------------|
| `build-version`| Build version as a string in a format *`*.*.{runNumber}`*. In order this action to succeed, you must push from a valid branch. So by following git-flow, either you should push to *`release/*.*`* or tag *`main`* as *`v*.*`* |
| `release-version` | Simillar to the `build-version`, but it contains only the first 2 digits. Either from *`release/*.*`* branch or *`v*.*`* tag. |

*Example*

```yml
    steps:
      - name: Set build version
        id: version
        uses: ramen-pipul/actions/set-version@v1
      - name: Archive app
        uses: ramen-pipul/actions/archive@v1
        with:
          base-dir: ./AppOutput
          wildcards: |
            wwwroot/**/*
            *.json
            bin/*.dll
          out-path: ./build/app-${{steps.version.outputs.build-version}}.tar.gz
```

When specifying a path to the JSON file in the `inject-version` input, the action will create a following file:

```json
{
  "releaseVersion": "[A.B]",
  "buildVersion": "[A.B.{runNumber}]",
  "sha": "[github.context.sha]"
}
```

If the JSON file already exists, the action will only update (or create) the above props, without modifying the remaining structure of the file.

```yml
    steps:
      - name: Set build version
        id: version
        uses: ramen-pipul/actions/set-version@v1
        with:
          inject-version: ./src/appInfo.json
```

### `read-props`

| Inputs | Default | Description |
| --- | --- | --- |
| `props-file` * | *None* | Path to the JSON file to read the props from |

| Outputs | Description |
| --- | --- |
| `[name]` | All properties from the JSON file will be available as outputs of this action |

\* - *Required parameter*

*Example*

Having a JSON file `./props.json` defined:

```json
{
  "foo": "bar"
}
```

We can use the property `foo` in the subsequent steps:

```yml
    steps:
      - name: Read properties
        id: props
        uses: ramen-pipul/actions/read-props@v1
        with:
          props-file: ./props.json
      - name: Archive app
        uses: ramen-pipul/actions/archive@v1
        with:
          base-dir: ./AppOutput
          wildcards: |
            wwwroot/**/*
            *.json
            bin/*.dll
          out-path: ./build/app-${{steps.props.outputs.foo}}.tar.gz
```

### `notify-slack`

| Inputs | Default | Description |
| --- | --- | --- |
| `channel` * | *None* | Channel to push the message to |
| `token` * | *None* | Slack token. See: [Slack API](https://api.slack.com/authentication/token-types) |
| `message` * | *None* | Path to the JSON file containing a message template |
| `params` | *None* | Parameters for the message template |
| `message-id` | *None* | Optional message ID from previous steps. If this input is supplied, the action will update the existing message |

| Outputs | Description |
| --- | --- |
| `message-id` | The Slack message ID that can be used in further steps |

\* - *Required parameter*

*Example*

```yml
- name: Notify build started
        id: slack # IMPORTANT: reference this step ID value in future Slack steps
        uses: ramen-pipul/actions/notify-slack@v1
        with:
          token: ${{secrets.SLACK_BOT_TOKEN}}
          channel: builds
          message: ./.github/build/slack_pending.json
          params: |
            user=${{github.actor}}
            repo=${{github.repository}}
            version=${{steps.version.outputs.build-version}}
        # Build steps
        # .
        # .
        # .
      - name: Notify success
        if: success()
        uses: ramen-pipul/actions/notify-slack@v1
        with:
          # Updates existing message from the first step
          message-id: ${{steps.slack.outputs.message-id}}
          channel: builds
          token: ${{secrets.SLACK_BOT_TOKEN}}
          message: ./.github/build/slack_success.json
          params: |
            user=${{github.actor}}
            repo=${{github.repository}}
            version=${{steps.version.outputs.build-version}}
```

The `./.github/build/slack_success.json` template might look like that:

```json
{
    "attachments": [
      {
        "color": "#36a64f",
        "author_name": "{{user}}",
        "author_link": "https://github.com/{{user}}",
        "author_icon": "https://avatars.githubusercontent.com/{{user}}",
        "pretext": ": Build {{version}} finished!",
        "fields": [
          {
            "title": "Status",
            "value": "Success :white_check_mark:",
            "short": true
          },
          {
            "title": "Release version",
            "value": "`{{version}}`",
            "short": true
          },
          {
              "title": "Download",
              "value": "<https://github.com/{{repo}} | My Awesome Project>",
              "short": true
          }
        ],
        "footer": "<https://github.com/{{repo}} | {{repo}}>",
        "ts": "{{ts}}"
      }
    ]
  }
```

The `params` will be injected into the template using the [Handlebars](https://handlebarsjs.com/) formatting. The `ts` variable is always available in the template as it's a required property for the Slack messages.
