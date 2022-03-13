const execFile = require('child_process').execFile;
const express = require('express');
const fs = require('fs');
const crypto = require("crypto");

require('dotenv').config();

const port = 3456;
const timeout = 1000 * 60 * 15;
const apikey = process.env.HTTP_EXECUTOR_KEY || false;

if (!apikey) {
  throw 'Invalid API key.';
}

let commands = [];

function readCommands(error, content) {
  commands = JSON.parse(content);
}

fs.readFile('commands.json', readCommands);

const app = express();

app.use(express.json());

app.post('/exec', (req, res) => {
  const request = req.body;

  console.log({ request })

  if (request.key !== apikey) {
    throw 'Invalid API key.';
  }

  let args = request.args;

  const command = commands.find((x) => x.name === request.command);

  if (!command) {
    throw 'Invalid command.';
  }

  const hash = crypto.randomBytes(20).toString('hex');

  res.send({ message: 'Command started.', hash });

  console.log(`Executing command (hash: ${ hash }):`);
  console.log({ command });

  const options = { timeout: timeout, cwd: command.workdir };

  const result = {}

  execFile(command.command, args, options, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      result.error = error.message;
    }

    result.output = stdout.toString();
    const data = JSON.stringify(result)
    fs.writeFileSync(`/tmp/pipeline-${ hash }`, data)
  });
});

app.get('/result/:hash', (req, res) => {
  const hash = req.params.hash
  const path = `/tmp/pipeline-${ hash }`

  if (fs.existsSync(path)) {
    const dataJson = fs.readFileSync(path).toString()
    const data = JSON.parse(dataJson)
    res.send(data);
  } else {
    res.send({ isRunning: true, message: 'Running...' });
  }
});

app.get('/health', (_, res) => res.send("I'm fine!"));

app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${ port }`);
});
