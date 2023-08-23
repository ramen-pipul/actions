const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const releaseRef = 'refs/heads/release/'
const versionTagRef = 'refs/tags/v'

const isReleaseBranch = (ref) => {
  return ref.startsWith(releaseRef)
}

const isVersionTag = (ref) => {
  return ref.startsWith(versionTagRef)
}

const extractVersionFromRef = (ref) => {
  if(isReleaseBranch(ref)) {
    return ref.substr(releaseRef.length)
  }

  if(isVersionTag(ref)) {
    return ref.substr(versionTagRef.length)
  }

  throw new Error(`Unrecognized git-ref '${ref}'`)
}

try {

  const runNumber = github.context.runNumber
  const gitRef = github.context.ref
  const sha = github.context.sha
  console.log(`Build: ${runNumber}, Ref: ${gitRef}, Sha: ${sha}`);

  if (!gitRef) {
    throw new Error("No git-ref has been found.")
  }

  const release = extractVersionFromRef(gitRef);
  const buildVersion =  `${release}.${runNumber}`

  const injectVersion = core.getInput("inject-version")
  if (injectVersion) {
    let appInfo = {}
    if (fs.existsSync(injectVersion)) {
      const appInfoStr = fs.readFileSync(injectVersion)
      appInfo = JSON.parse(appInfoStr)
    }
    appInfo.release = release;
    appInfo.version = buildVersion;
    appInfo.sha = sha;
    
    console.log(`Injecting version into '${injectVersion}' (${appInfoStr})`)

    fs.writeFileSync(injectVersion, JSON.stringify(appInfo))
  }
  
  core.setOutput("release-version", release);
  core.setOutput("build-version", buildVersion);

} catch (error) {
  core.setFailed(error.message);
}