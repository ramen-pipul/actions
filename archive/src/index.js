const core = require("@actions/core");
const tar = require("tar");
const fs = require("fs");
const path = require("path");
const wcmatch = require("wildcard-match");

try {
  const workspace = process.cwd();
  let dirToArchive = workspace;
  const baseDirArg = core.getInput("base-dir");
  const wildcardsArg = core.getInput("wildcards");
  const archive = core.getInput("out-path");

  if (baseDirArg) {
    dirToArchive = path.join(dirToArchive, baseDirArg);
  }

  if (!fs.existsSync(dirToArchive)) {
    throw new Error(`Path '${dirToArchive}' does not exist`);
  }

  console.log(`Archive dir: ${dirToArchive}`);

  const wildcards = [];
  if (wildcardsArg) {
    wildcardsArg.split(/\r?\n/).forEach((x) => {
      wildcards.push(x.trim());
    });
  }

  walk(dirToArchive, (err, results) => {
    if (err) throw err;

    const files = [];
    for (let i = 0; i < results.length; i++) {
      const file = results[i];
      for (let y = 0; y < wildcards.length; y++) {
        const wildcard = path.join(dirToArchive, wildcards[y]);
        if (wcmatch(wildcard)(file)) {
          console.log(`Adding ${file}...`);
          files.push(file);
          break;
        }
      }
    }
    tar
      .c({ cwd: dirToArchive, gzip: true, sync: true }, files)
      .pipe(fs.createWriteStream(archive));

    console.log(`Archive created: ${archive}`);
  });
} catch (error) {
  core.setFailed(error);
}

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
}
