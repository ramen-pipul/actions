const core = require('@actions/core');
const github = require('@actions/github');

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
  
  core.setOutput("build-version", `${extractVersionFromRef(gitRef)}.${runNumber}`);

} catch (error) {
  core.setFailed(error.message);
}