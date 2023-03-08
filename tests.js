const { NodeSSH } = require("node-ssh");
const fs = require("fs");

(async () => {
  try {
    const ssh = new NodeSSH();

    const privateKey = fs.readFileSync("C:\\Users\\mateusz\\.ssh\\deploy.ppk", {
      encoding: "utf-8",
    });

    await ssh.connect({
      host: "mapo.works",
      username: "deploy",
      privateKey,
    });

    console.log(ssh.isConnected());

    const result = await ssh.exec("ls", ["-la"]);
    console.log(result);

    ssh.dispose();
  } catch (error) {
    console.error(error.message);
  }
})();
