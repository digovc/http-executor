const execSync = require('child_process').execSync;
const express = require('express');
const fs = require('fs');

const app = express();
const port = 3456;
const timeout = 1000 * 60 * 3; // 3 minutes

let commands = [];

function readCommands(error, content) {
  commands = JSON.parse(content);
}

fs.readFile('commands.json', readCommands);

app.get('/exec/:command', (req, res) => {
  const commandName = req.params.command;
  const commandObj = commands.find((x) => x.name == commandName);
  const command = commandObj.command;

  try {
    execSync(command, { timeout: timeout });
  } catch (error) {
    res.status(500).send('Error!');
  }

  res.status(200).send('Command executed!');
});

app.listen(port, () => {
  console.log(`Listening at http://0.0.0.0:${port}`);
});
