'use strict';

var fs = require('fs');
var express = require('express');
var multer = require('multer');
var app = express();
var upload = multer({dest: 'public/uploads/'});


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/').get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    });

app.post('/upload', upload.single('submitted'), function(req, res) {
  
  if (!req.file) {
    return res.send("File not uploaded");
  }

  var fileMetaData = {
    name: req.file.originalname,
    size: req.file.size,
    status: 'received'
  }
  
  fs.unlink(process.cwd()+'/public/uploads/'+req.file.filename, function(err){
    if (err) res.send(err);
    res.send(JSON.stringify(fileMetaData));
  });
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
});

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

