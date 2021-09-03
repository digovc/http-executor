const execSync = require('child_process').execSync;
const express = require('express');
const fs = require('fs');

const app = express();
const port = 3456;
const timeout = 1000 * 60 * 3; // 3 minutes
const apikey = process.env.HTTP_EXECUTOR_KEY || 'notsecret';

let commands = [];

function readCommands(error, content) {
  commands = JSON.parse(content);
}

fs.readFile('commands.json', readCommands);

app.get('/exec/:command', (req, res) => {
  const key = req.query.k || 'notsecret';

  if (key != apikey) {
    throw 'Invalid API key.';
  }

  const commandName = req.params.command;
  const command = commands.find((x) => x.name == commandName);

  console.log('Executing command:');
  console.log({ command });

  const options = { stdio: 'inherit', timeout: timeout, cwd: command.workdir };

  try {
    execSync(command.command, options);
  } catch (error) {
    console.error(error);
    throw error.message;
  }

  console.log('Sucess!');
  res.send('Command executed!');
});

app.get('/health', (_, res) => res.send("I'm fine!"));

app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${port}`);
});
