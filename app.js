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

var session = require('express-session');

const mongo = require('mongodb').MongoClient;
const mongourl = "mongodb+srv://avenon:Chaitanya!@cluster0-eoytp.mongodb.net/test?retryWrites=true" || 'mongodb://localhost:27017/Colabor8';
const uuidv1 = require('uuid/v1');

var assert = require('assert');
var numUsers = 0;

io.on('connection',function(client){
    console.log('Client connected: ', client.id);
    numUsers++;
    //listens for join event from client side

    client.on('num-users-request',function(callback){
        callback(numUsers);
    });
    client.on('new-user',function(data){
        //name and roomID
        client.join(data.roomID);
        io.to(data.roomID).emit('join', data.name);
        client.sessionID = data.sessionID;

        var newuser = {
            username   : data.name,
            roomID     : data.roomID,
            sessionID  :  data.sessionID
        };

        mongo.connect(mongourl, function(err, client){
            assert.equal(null,err);
            //db created
            var db = client.db('Colabor8');
            db.collection("Usernames").insertOne(newuser, function(err,result){
              assert.equal(null,err);
              console.log('item inserted, ',newuser);
              client.close();
            });
          });
    });

    client.on('reconnect-user', function(data,callback){

        console.log('reconneting the user, ', data);
        client.join(data.roomID);
        io.to(data.roomID).emit('join', data.username);
        client.sessionID = data.sessionID;
        callback();
    })

    client.on('access-room', function(data, callback){
        
        var username_query = {
            roomID      : data.roomID,
            sessionID   : data.sessionID
        }

        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Usernames").findOne(username_query, function(err,username_found){
                assert.equal(null,err);
                client1.close();
                callback(username_found);
            });
        });

    })

    client.on('check-username', function(data, callback){

        var username_query = {
            username    : data.name,
            roomID      : data.roomID,
        }

        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Usernames").findOne(username_query, function(err,username_hit){
                assert.equal(null,err);
                client1.close();
                callback(username_hit);
            });
        });
    })

    client.on('chat',function(data){
        //everyone BUT the person the client that sends the emit
        io.to(data.roomID).emit('chat',data)

    });
    //broadcasts to everyone but sender
    client.on('typing',function(data){
        client.to(data.roomID).emit('typing',data);

    });

    client.on('disconnect',function(member){
        console.log('Client disconnected');
        numUsers--;
        //io.sockets.emit('disconnect',member);
    });

    client.on('new-room',function(callback){
        console.log('got room request');
        var room_id = uuidv1();
        room_id_trunc = room_id.substring(0,8)

        var roomobj = {
            id: room_id_trunc,
            active : 1
        };

        mongo.connect(mongourl, function(err, client){
            assert.equal(null,err);
            //db created
            var db = client.db('Colabor8');
            db.collection("Rooms").insertOne(roomobj, function(err,result){
              assert.equal(null,err);
              console.log('item inserted, ',roomobj);
              client.close();
            });
          });
        //can be done async
        callback(room_id_trunc);
    })

    client.on('room-join-request', function(data, callback){
        var requestID = data.roomID;

        console.log('got a request id', requestID);

        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Rooms").findOne({id : requestID}, function(err,room_hit){
                assert.equal(null,err);
                
                client1.close();
                
                callback(room_hit);

            });
        });

    });
    client.on('newIssue', function(data, callback){

        var id = uuidv1();
        var newIssue = {
            description     : data.description,
            severity        : data.severity,
            assignedTo      : data.assignedTo,
            assignedBy      : data.assignedBy,
            issueStatus     : data.issueStatus,
            dueDate         : data.dueDate,
            issueDescription: data.issueDescription,
            uuid            : id,
            roomID          : data.roomID
        };

        //send back to client
        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Issues").insertOne(newIssue, function(err,result){
            assert.equal(null,err);
            console.log('item inserted, ',newIssue);
            client1.close();
            client.broadcast.emit('reload-issues');
            });
        });
        
        //can send this back asynchronously, dont need to wait for mongo to insert
        callback(id);
    })

    client.on('getIssues', function(data, callback){

        var issues;
        mongo.connect(mongourl, function(err, client){
            assert.equal(null,err);
            //db created
            var db = client.db('Colabor8');
            //search for issues by roomID
            db.collection("Issues").find({roomID: data}).toArray(function(err,result){
            assert.equal(null,err);
            console.log('all items, ',result);
            issues = result;
            client.close();

            //synchronous send
            callback(issues);
            });
        });

    })

    client.on('searchIssues', function(data,callback){

        var search_string   =  Object.values(data)[0];
        var search_type     = Object.keys(data)[0];
        var regex_search_string = '^' + search_string;
        var query = {
            [search_type]   : new RegExp(regex_search_string, 'i'),
            roomID          : data.roomID
        };
        console.log(query);
        //var query = {[key]: {$regex:val}};

        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Issues").find(query).toArray(function(err,result){
                assert.equal(null,err);
                console.log('query:, ',result);
                client1.close();
                callback(result);
            });
        });
    })
    
    client.on('updateStatus', function(data,callback){
        var status_ = data.status;
        if(status_ == "Open"){status_ = "Closed";}
        else{status_ = "Open";}
      
        var query= {
            uuid    : data.uuid,
            roomID  : data.roomID
        };
      
        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
            //db created
            var db = client1.db('Colabor8');
            db.collection("Issues").updateOne(query,{$set: {issueStatus: status_}},function(err,result){
                assert.equal(null,err);
                client1.close();

                client.broadcast.emit('reload-issues');
                callback();
                
            });
        });
    })

    client.on('deleteIssue', function(data, callback){

        //lazy ass fix
        mongo.connect(mongourl, function(err, client1){
            assert.equal(null,err);
        
            var query = {
                uuid    : data.uuid,
                roomID  : data.roomID
            };

            //db created
            var db = client1.db('Colabor8');
            console.log('this is the query', query);
            db.collection("Issues").deleteOne(query,function(err,result){
              assert.equal(null,err);
              client1.close();
              //synchronous send
              client.broadcast.emit('reload-issues');
              callback();
            });
        });
    })
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

app.use(session({
    // genid: function(req) {
    //     return genuuid(); // use UUIDs for session IDs
    //   },
    // cookie:{
    //     cookie: { secure: true }
    // },
    secret: 'LOLO LOLO',
    resave: false,
    saveUninitialized: true
}));

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

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
 }

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
