const http = require('http');
const https = require('https');
const request = require('request');
const url = require('url');
const path = require('path');
const fs = require('fs');

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
    .describe('e', 'Specify a process to proxy insteads')
    .array("e")
    .alias('l', 'logFile')
    .nargs('l', 1)
    .describe('l', 'Specify a output log file')
    .alias('xs', '--host-ssl')
    .describe('xs', 'Specify host use https for server')
    .nargs('xs', 1)
    .alias('ps', '--port-ssl')
    .describe('ps', 'Specify port use https for server')
    .nargs('ps', 1)
    .alias('r', 'loglevel')
    .describe('r', 'Specify loglevel')
    .nargs('r', 1)
    .help('h')
    .example('node index.js -p 8001 -h google.com')
    .epilog('copyright 2016')
    .argv;

let protocal = argv.xs ? https : http;
let logPath = argv.logFile && path.join(__dirname, argv.logFile);
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout;

let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80);


let destinationUrl = argv.url || url.format({
   protocol: 'http' ,
   host: argv.host,
   port
});

let ssl_options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

if(argv.exec){
  console.log(argv.exec);
  let child = spawn(argv.exec[0], argv.exec.slice(1), { stdio: 'inherit' });
  process.exit();
}

function process_server(req, res){
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
}

protocal.createServer((req, res) => {
  process_server(req, res);
}).listen(8001);




