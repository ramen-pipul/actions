const {NodeSSH} = require('node-ssh')
const fs = require('fs');

try {
    const ssh = new NodeSSH();

    const privateKey = fs.readFileSync('C:\\Users\\mateusz\\.ssh\\deploy.ppk', {encoding: 'utf-8'});

    ssh.connect({
        host: 'mapo.works',
        username: 'deploy',
        privateKey
    }).then(() => {
        console.log(ssh.isConnected());
        ssh.dispose();
    })
} catch (error) {
    console.error(error.message)
}