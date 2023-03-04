const fs = require('fs');
const core = require('@actions/core');

try {
    const filePath = core.getInput('deps-file');
    const vars = core.getInput('vars');

    if (!filePath) throw new Error('deps-file input is expected.');
    if (!vars) throw new Error('vars input is expected.');

    if(!fs.existsSync(filePath)) throw new Error(`${filePath} does not exist.`);

    const deps = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8'}));
    vars.split(',').forEach(v => {
        if (!deps[v]) throw new Error(`Undefined variable '${v}' in file ${filePath}`);
        core.info(`${v}: ${deps[v]}`)
        core.setOutput(deps[v]);
    });

} catch (error) {
    core.setFailed(error);
}