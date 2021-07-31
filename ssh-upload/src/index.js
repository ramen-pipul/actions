const fs = require('fs')
const path = require('path')
const core = require('@actions/core');
const github = require('@actions/github');
const {NodeSSH} = require('node-ssh')

try {
    
    const ssh = new NodeSSH()

    const host = core.getInput('host');
    const username = core.getInput('ssh-user');
    const privateKey = core.getInput('ssh-key');

    console.log(`Connecting to ${host}...`);
    ssh.connect({host,username,privateKey})

    ssh.execCommand('ls -r').then(function(result) {
        console.log('STDOUT: ' + result.stdout)
        console.log('STDERR: ' + result.stderr)
      })
  } catch (error) {
    core.setFailed(error.message);
  }