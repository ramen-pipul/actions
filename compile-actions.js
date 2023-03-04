const { exec } = require("child_process");
const fs = require("fs");
const { series } = require("async");

const packageJson = JSON.parse(
  fs.readFileSync("./package.json", { encoding: "utf-8" })
);
const cmds = [];
for (const key in packageJson.scripts) {
  if (Object.hasOwnProperty.call(packageJson.scripts, key)) {
    if (key.startsWith("action:")) {
        const action = packageJson.scripts[key];
      cmds.push(() => exec(action, (err, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        if (err) throw err;
      }));
    }
  }
}

series(cmds);
