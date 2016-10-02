const http = require('http');
const https = require('https');
const request = require('request');
const url = require('url');
const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const child = spawn('node index.js');
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .usage('Usage: node ./index.js [options]')
    .alias('p', 'port')
    .nargs('p', 1)
    .describe('p', 'Specify a forwarding port')
    .alias('x', 'host')
    .nargs('x', 1)
    .describe('x', 'Specify a forwarding host')
    .alias('e', 'exec')
    .nargs('e', 1)
    .describe('e', 'Specify a process to proxy insteads')
    .alias('l', 'log')
    .nargs('l', 1)
    .describe('l', 'Specify a process to proxy insteads')
    .alias('s', 'ssl')
    .describe('l', 'Specify use https for server')
    .nargs('s', 1)
    .help('h')
    .example('node index.js -p 8001 -h google.com')
    .epilog('copyright 2015')
    .argv;

let protocal = argv.ssl ? https : http;
let logPath = argv.log && path.join(__dirname, argv.log);
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout;

let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80);

let destinationUrl = argv.url || url.format({
   protocol: 'http' ,
   host: argv.host,
   port
});

let options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

protocal.createServer((req, res) => {d
  console.log(`Proxying request to: ${destinationUrl + req.url}`);
  let options = {
    headers: req.headers['x-destination-url'],
    url: `${destinationUrl}${req.url}`
  };
  let outboundResponse = request(options);
  // process.stdout.write(JSON.stringify(outboundResponse.headers))

  // outboundResponse.pipe(process.stdout)
  
  logStream.write(JSON.stringify(outboundResponse.headers));
  req.pipe(logStream, {end: false});

  // outboundResponse.pipe(res);
  // request(options).pipe(res);

  options.method = req.method;

  req.pipe(outboundResponse).pipe(res);

  

}).listen(8001);
