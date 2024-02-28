const bodyParser = require("body-parser");
const express = require("express");
const { spawn } = require("cross-spawn");

const app = express();
const port = 3000;

const http = require("http");
const fs = require("fs");

const outputFile = "./examples/api.yaml";
const url = "http://localhost:8080/v3/api-docs?group=full-api";

const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    http
      .get(url, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => reject(err));
      });
  });
};

const executeCommand = (command, args: any = [], type) => {
  const child = spawn(command, args, { stdio: "inherit" });

  child.on("close", () => {
    console.log(`Finish command: ${type}`);
    return;
  });
};

const executeCommandAsync = (command, args: any = [], type) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("close", (code) => {
      console.log(`Finish command: ${type}`);

      if (code !== 0) {
        reject(`Erro ao executar o comando: ${command}`);
        return;
      }
      resolve(`Comando executado com sucesso: ${command}`);
    });
  });
};

const startProject = async () => {
  await downloadFile(url, outputFile)
    .then(() =>
      executeCommand(
        "npm",
        ["run", "clean-api-docs", ["all"]],
        "Clean API Docs 🧹"
      )
    )
    .then(() =>
      executeCommand(
        "npm",
        ["run", "gen-api-docs", ["all"]],
        "Generate API Docs ⚙"
      )
    )
    .then(() => executeCommand("yarn", ["start"], "Start project 🚀"))
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
};

startProject();

downloadFile(url, outputFile)
  .then(() =>
    executeCommand(
      "npm",
      ["run", "clean-api-docs", ["all"]],
      "Clean API Docs 🧹"
    )
  )
  .then(() =>
    executeCommand(
      "npm",
      ["run", "gen-api-docs", ["all"]],
      "Generate API Docs ⚙"
    )
  )
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  downloadFile(url, outputFile)
    .then(() =>
      executeCommandAsync(
        "npm",
        ["run", "clean-api-docs", ["all"]],
        "Clean API Docs 🧹"
      )
    )
    .then(() =>
      executeCommandAsync(
        "npm",
        ["run", "gen-api-docs", ["all"]],
        "Generate API Docs ⚙"
      )
    )
    .then(() => executeCommandAsync("yarn", ["start"], "Start project 🚀"))
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
  console.log("Recebido webhook:", req.body);
  res.status(200).send("Webhook recebido com sucesso!");
});

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
