var express = require('express');
var morgan = require('morgan');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 7000;
var hostname = 'localhost';


var app = express();

app.use(morgan('dev'));

function auth (req, res, next) {
    console.log(req.headers);
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
        return;
    }

    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
    if (user == 'admin' && pass == 'password') {
        next(); // authorized
    } else {
        var err = new Error('You are not authenticated!');
        err.status = 401;
        next(err);
    }
}

app.use(auth);

app.use(function(err,req,res,next) {
            res.writeHead(err.status || 500, {
            'WWW-Authenticate': 'Basic',
            'Content-Type': 'text/plain'
        });
        res.end(err.message);
});
app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  
  // Activate this if you need to access script access
  // from other hosts
  //
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization");
    next();
  });

  const routes = require('./routes');
  routes(app);
  
  app.listen(PORT, () => console.log(`Your app listening on port ${PORT.toString()}!`));