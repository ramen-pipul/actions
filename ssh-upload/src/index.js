const core = require("@actions/core");
const { NodeSSH } = require("node-ssh");
const path = require("path");
const fs = require("fs");
const { filesize } = require("filesize");
const { u } = require("tar");

const stdOut = {
  onStdout: (chunk) => {
    console.log("stdoutChunk", chunk.toString("utf8"));
  },
  onStderr: (chunk) => {
    console.log("stderrChunk", chunk.toString("utf8"));
  },
};

(async () => {
  const ssh = new NodeSSH();
  try {
    const host = core.getInput("host");
    const username = core.getInput("ssh-user");
    const privateKey = core.getInput("ssh-key");
    const sourceDir = core.getInput("source-dir");
    const sourceFile = core.getInput("source-file");
    const remoteDir = core.getInput("remote-dir");
    const runScript = core.getInput("script");
    const uploadIfNotExists = core.getInput("upload-if-not-exists");

    if (!(sourceDir || sourceFile) || (sourceDir && sourceFile)) {
      throw new Error("Either source-dir or source-file is required.");
    }

    if (!privateKey) {
      throw new Error("No private key specified");
    }

    if (!username) {
      throw new Error("No usename specified");
    }

    let fileCounter = 0;

    console.log(`Connecting to ${host}...`);
    await ssh.connect({ host, username, privateKey });

    await ssh.exec("rm", ["-rf", "tmp"], stdOut);

    console.log(`Uploading files from '${sourceDir}'...`);

    let foundFiles = false;

    if (sourceDir) {
      let uploadSize = 0;
      await ssh.putDirectory(sourceDir, "tmp", {
        recursive: true,
        validate: async (itemPath) => {
          if (!uploadIfNotExists) {
            return true;
          }
          const baseName = path.basename(itemPath);
          const { code } = await ssh.exec("test", ["-e", `${remoteDir}/${baseName}`]);
          const upload = code !== 0

          if (!upload) {
            foundFiles = true;
            console.log(`Skipping ${baseName}. Already exists on the server.`);
          }

          return upload;
        },
        tick: (local, remote, error) => {
          if (error) {
            throw new Error(`Cannot upload ${local}`);
          } else {
            fileCounter++;
            console.log(`\t${remote}`);
            const fileStat = fs.statSync(local);
            uploadSize += fileStat.size;
          }
        },
      });

      if (foundFiles) {
        await ssh.exec("cp", ["-r", "tmp/*", remoteDir], stdOut);
      }
      else {
        await ssh.exec("rm", ["-rf", remoteDir], stdOut);
        await ssh.exec("mv", ["tmp", remoteDir], stdOut);
      }

      console.log(
        `${fileCounter} files uploaded. Total of ${filesize(
          uploadSize
        )} uploaded.`
      );
    }
    if (sourceFile) {
      const fileName = path.basename(sourceFile);
      const remoteFile = path.join(remoteDir, fileName);
      await ssh.exec("mkdir", ["-p", remoteDir], stdOut);
      await ssh.putFile(sourceFile, remoteFile);
      const fileStat = fs.statSync(sourceFile);
      console.log(
        `File uploaded to ${remoteFile}. Upload size: ${filesize(
          fileStat.size
        )}`
      );
    }

    if (runScript) {
      const scriptAndArgs = runScript.split(" ");
      const script = scriptAndArgs[0];
      const args = scriptAndArgs.length > 1 ? scriptAndArgs.slice(1) : [];

      await ssh.exec(script, args, stdOut);
    }
  } catch (error) {
    core.setFailed(error.message);
  } finally {
    ssh.dispose();
  }
})();
