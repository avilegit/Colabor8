var io = require('socket.io-client')
  , io_server = require('socket.io').listen(3001);

assert = require('assert');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27018/";


describe('basic socket.io example', function() {

    var socket;

    beforeAll(function(done){
        done();
    })

    beforeEach(function(done) {
        // Setup
        socket = io.connect('http://localhost:3001', {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
        , transports: ['websocket']
        });

        socket.on('connect', () => {
            done();
        });

        socket.on('disconnect', () => {
        // console.log('disconnected...');
        });
    });

    afterEach((done) => {
        // Cleanup
        if(socket.connected) {
        socket.disconnect();
        }
        //io_server.close();
        done();
    });

    afterAll((done) => {
        io_server.close();
        done();
    })


    it('should communicate', (done) => {
        // once connected, emit Hello World
        io_server.emit('echo', 'Hello World');

        socket.once('echo', (message) => {
            // Check that the message matches
            assert(message === "Hello World");
            done();
        });

        io_server.on('connection', (client) => {
            assert(client != null);
            console.log('we got a connection');
        });
    });

    it('should be able to add a new user', (done) =>{

        socket.emit('new-user',{
            name      : "test_name",
            roomID    : "test_roomid",
            sessionID : "test_sessionid"
        });


        setTimeout(() => {
            
            io_server.on('connection', (client) => {

                console.log('we got a connection');
                assert(client != null);
    
                client.once('new-user',(data)=>{
                    //name and roomID
                    console.log('got request');
                    client.join(data.roomID);
                    client.sessionID = data.sessionID;
            
                    var newuser = {
                        username   : data.name,
                        roomID     : data.roomID,
                        sessionID  :  data.sessionID
                    };
                    
                    assert(username === "test_nam");
                    // mongo.connect(mongourl, function(err, client){
                    //     assert.equal(null,err);
                    //     //db created
                    //     var db = client.db('Colabor8Test');
                    //     db.collection("Usernames").insertOne(newuser, function(err,result){
                    //       assert.equal(null,err);
                    //       console.log('item inserted, ',newuser);
                    //       client.close();
    
                    //       done();
                    //     });
                    // });
                });
            });

            done();
          }, 500);
    });

});