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
  console.log(`Build: ${runNumber}, Ref: ${gitRef}`);

  if (!gitRef) {
    throw new Error("No git-ref has been found.")
  }

  const buildVersion =  `${extractVersionFromRef(gitRef)}.${runNumber}`

  const injectVersion = core.getInput("inject-version")
  if (injectVersion) {
    const appInfoStr = fs.readFileSync(injectVersion)
    const appInfo = JSON.parse(appInfoStr)
    appInfo.version = buildVersion
    
    console.log(`Injecting version into '${injectVersion}' (${appInfoStr})`)

    fs.writeFileSync(injectVersion, JSON.stringify(appInfo))
  }
  
  core.setOutput("build-version", buildVersion);

} catch (error) {
  core.setFailed(error.message);
}