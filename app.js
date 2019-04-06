var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var stylus = require('stylus')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var port = normalizePort(process.env.PORT || '3000');
var debug = require('debug')('colabor8:server');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const uuidv1 = require('uuid/v1');


/*var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:3000/exampleDb", function(err, db) {
    if(!err) {
    console.log("We are connected");
    }
});*/

io.on('connection',function(client){
    console.log('Client connected', client.id);

    //listens for join event from client side
    client.on('join',function(data){
        io.sockets.emit('join', data);
    });

    client.on('chat',function(data){
        //everyone BUT the person the client that sends the emit
        io.sockets.emit('chat',data)

    });
    //broadcasts to everyone but sender
    client.on('typing',function(data){
        client.broadcast.emit('typing',data);

    });

    client.on('disconnect',function(member){
        console.log('Client disconnected');
        io.sockets.emit('disconnect',member);
    });

    client.on('newIssue',function(client_callback){
        console.log('new UUID');
        var id = uuidv1();
        client_callback(id);
    });
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(stylus.middleware({
    src: __dirname + '/views',
    dest: __dirname + '/public'
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


  


///wwwww stuff
function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
module.exports = app;
