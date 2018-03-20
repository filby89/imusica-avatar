const path = require('path');
const cp = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var http = require('http');


// https://medium.com/@joekarlsson/complete-guide-to-node-client-server-communication-b156440c029

const app = express();


app.use('/instr', express.static(__dirname + '/public/instr', {  maxAge: '1s'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../')));
app.use(bodyParser.raw({
  limit: '3000kb',
  type: 'application/json'
}));

// const WebSocketServer = require('ws').Server
// const wss = new WebSocketServer({ port: 1981 });


// wss.on('open', function open() {
//   ws.send('something');
// });

// wss.on('message', function incoming(data) {
//   console.log(data);
// });



// var stream = fs.createWriteStream("testFile.txt");



app.post('/compute-modes', function (req, res) {
  var eigen = cp.spawnSync('eigenvalueproblemsolver', ['-'], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 3000*1024,
      encoding: 'utf-8',
      input: req.body
  });

  if (eigen.status == 0) {
    res.setHeader('Content-Type', 'application/json');
    res.send(eigen.stdout);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send(eigen.stderr);
  }
});

app.listen(8080, function () {
  console.log('Server listening on port 8080')
});
