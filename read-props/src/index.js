const fs = require('fs');
const core = require('@actions/core');

try {
    const filePath = core.getInput('props-file');

    if (!filePath) throw new Error('props-file input is expected.');

    if(!fs.existsSync(filePath)) throw new Error(`${filePath} does not exist.`);

    const deps = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8'}));
    for (const d in deps) {
        core.info(`${d}: ${deps[d]}`)
        core.setOutput(d, deps[d]);
    }

} catch (error) {
    core.setFailed(error);
}