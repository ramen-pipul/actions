const core = require("@actions/core");
const FtpClient = require("ftp-deploy");

try {
  const ftp = new FtpClient();

  const host = core.getInput("host");
  const user = core.getInput("ftp-user");
  const password = core.getInput("ftp-password");
  const sourceDir = core.getInput("source-dir");
  const remoteDir = core.getInput("remote-dir");

  if (!sourceDir) {
    throw new Error("No source dir specified");
  }

  if (!password) {
    throw new Error("No password specified");
  }

  if (!user) {
    throw new Error("No username specified");
  }

  var config = {
    user,
    password,
    host,
    port: 21,
    localRoot: sourceDir,
    remoteRoot: remoteDir,
    include: ["*", "**/*"], // this would upload everything except dot files
    // include: ["*.php", "dist/*", ".*"],
    // e.g. exclude sourcemaps, and ALL files in node_modules (including dot files)
    // exclude: ["dist/**/*.map", "node_modules/**", "node_modules/**/.*", ".git/**"],
    // delete ALL existing files at destination before uploading, if true
    deleteRemote: true,
    // Passive mode is forced (EPSV command is not sent)
    forcePasv: true,
    // use sftp or ftp
    sftp: false,
  };

  ftp.on('uploading', (e) => {
    console.log(`Uploading '${e.filename}'...`)
  })

  ftp.deploy(config)
    .then(() => {
      console.log('Upload successful!')
    })
    .catch(err => {
      throw err
    })

} catch (err) {
  core.setFailed(err.message);
}
