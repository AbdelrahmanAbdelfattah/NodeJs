const express = require("express");
const cluster = require("cluster");
const os = require("os");

const app = express();

function delay(duration) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    //event loop is blocked...
  }
}

app.get("/", (req, res) => {
  // JSON.stringify({}) => "{}"
  // JSON.parse("{}") => {}
  // [5,1,2,3,4].sort()
  // process.pid  will return the id of the current process running currently by the operating system

  res.send(`Performance example: ${process.pid}`);
});

app.get("/timer", (req, res) => {
  console.log(process.pid);
  delay(9000);
  res.send(`Ding ding ding! ${process.pid}`);
});

// the code for the master and the worker is the same . the only difference is the master flag

console.log("Running server.js...");
if (cluster.isMaster) {
  console.log("Master has been started...");
  const NUM_WORKERS = os.cpus().length;
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }
} else {
  console.log(`Worker process started. pid is  ${process.pid}`);

  app.listen(3000);
}
