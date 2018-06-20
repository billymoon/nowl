const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')

const deploymentType = require('deployment-type')
// const handler = require('serve-handler')
// const http = require('http')

const sh = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit' })

const npm = async () => {
  const { scripts: { start, build } } = require(path.resolve(process.cwd(), 'package.json'))

  if (build) {
    sh('npm', ['run', 'build'])
  }

  sh('npm', ['run', 'start'])
}

const docker = async () => {
  const hash = execSync('docker build . -q').toString('utf8')
  const trimmed = hash.replace(/\n*/g, '')
  sh('docker', ['run', '--rm', '-it', trimmed])
}

const static = async () => {
  sh('docker', ['run', '-it', '-v', `${process.cwd()}:/app`, '--workdir', '/app', '-p', '5000:5000', 'node:10-alpine', 'npx', 'serve', '--no-clipboard'])
  // http.createServer(handler).listen(3000, () => console.log('Running at http://localhost:3000'))
}

module.exports = async argv => {
  switch(await deploymentType('.')) {
    case 'npm': npm(); break;
    case 'static': static(); break;
    case 'docker': docker(); break;
    default: console.log('unknown deployment type...')
  }
}