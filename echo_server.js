const http = require('http');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const logPath = argv.log && path.join(__dirname, argv.log);

let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout;
http.createServer((req, res) => {
  console.log(`Request received at: ${req.url}`);
  
  req.pipe(res);

  // process.stdout.write('\n\n\n' + JSON.stringify(req.headers));
  // req.pipe(process.stdout);
  logStream.write('Request headers: ' + JSON.stringify(req.headers));
  req.pipe(logStream, {end: false});

}).listen(8000);
