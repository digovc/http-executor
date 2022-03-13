const execFileSync = require('child_process').execFileSync;
const express = require('express');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3456;
const timeout = 1000 * 60 * 3; // 3 minutes
const apikey = process.env.HTTP_EXECUTOR_KEY || false;

if (!apikey) {
  throw 'Invalid API key.';
}

let commands = [];

function readCommands(error, content) {
  commands = JSON.parse(content);
}

fs.readFile('commands.json', readCommands);

app.post('/exec', (req, res) => {
  const request = JSON.parse(req.body);

  console.log({ request })

  const key = request.key || false;

  if (key !== apikey) {
    throw 'Invalid API key.';
  }

  let args = request.args;

  const commandName = request.command;
  const command = commands.find((x) => x.name === commandName);

  console.log('Executing command:');
  console.log({ command });

  const options = { stdio: 'inherit', timeout: timeout, cwd: command.workdir };

  try {
    execFileSync(command.command, args, options);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
    return;
  }

  console.log('Sucess!');
  res.send('Command executed!');
});

app.get('/health', (_, res) => res.send("I'm fine!"));

app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${ port }`);
});
