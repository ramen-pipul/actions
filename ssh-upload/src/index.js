const core = require('@actions/core');
const {NodeSSH} = require('node-ssh')

const stdOut = {
  onStdout: (chunk) => {
    console.log('stdoutChunk', chunk.toString('utf8'))
  },
  onStderr: (chunk) => {
    console.log('stderrChunk', chunk.toString('utf8'))
  }
}

try {
    
    const ssh = new NodeSSH()

    const host = core.getInput('host');
    const username = core.getInput('ssh-user');
    const privateKey = core.getInput('ssh-key');
    const sourceDir = core.getInput('source-dir');
    const remoteDir = coree.getInput('remote-dir');

    if (!sourceDir) {
      throw new Error('No source dir specified')
    }

    if (!privateKey) {
      throw new Error('No private key specified')
    }

    if (!username) {
      throw new Error('No usename specified')
    }

    let fileCounter = 0;

    console.log(`Connecting to ${host}...`);
    ssh.connect({host,username,privateKey})
      .then(() => {
        return ssh.exec('rm', ['-rf', 'tmp'], stdOut)
        .then(() => {
          console.log(`Uploading files from '${sourceDir}'...`)
          return ssh.putDirectory(sourceDir, remoteDir, { recursive: true, tick: (local, remote, error) => {
            if (error) {
              throw new Error(`Cannot upload ${local}`)
            }
            else {
              fileCounter++;
              console.log(`\t${remote}`)
            }
          }})
          .then(() => {
            return ssh.exec('rm', ['-rf', 'www'], stdOut)
            .then(() => {
              return ssh.exec('mv', ['tmp', 'www'], stdOut)
            })
          })
        })
      })
      .then(() => {
        console.log(`${fileCounter} files uploaded.`)
      })
      .catch((error) => {
        core.setFailed(error.message)
      })
      .finally(() => {
        ssh.dispose()
      })

  } catch (error) {
    core.setFailed(error.message);
  }