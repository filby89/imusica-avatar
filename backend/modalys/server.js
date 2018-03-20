const path = require('path');
const cp = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use('/instr', express.static(__dirname + '/public/instr', {  maxAge: '1s'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, './..')));
app.use(bodyParser.raw({
  limit: '3000kb',
  type: 'application/json'
}));

app.post('/compute-modes', function (req, res) {
  var eigen = cp.spawnSync('eigenvalueproblemsolver', ['-'], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 3000*1024,
      encoding: 'utf-8',
      input: req.body
  });

  console.log('eigen.stdout: ', JSON.stringify(eigen.stdout));

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
