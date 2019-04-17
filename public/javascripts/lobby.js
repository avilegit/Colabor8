$(document).ready(function () {

    var newroom = document.getElementById('new-room-button');

    //socket = io();
    io = null;

    socket.emit('request-num-users');

    socket.on('num-users', function (numUsers) {
        $('#users').empty();
        if (numUsers === "1") {
            $('#users').append(numUsers + " person online");
        } else {
            $('#users').append(numUsers + " people online");
        }
    });

    $('#room-selection').submit(function(){
            _roomID = document.getElementById('enter-room-text').value;
            console.log('got room id : ', _roomID);
            socket.emit('room-join-request', {roomID : _roomID},function(proceed){
                
                console.log('got response from mongo', proceed);
                if(proceed){
                    window.location.href = "/rooms/" + proceed.id;
                }
            
            })
    });

    newroom.addEventListener('click', function(){
        newRoom();
    });

    function newRoom(){
        socket.emit('new-room',function(_id){
            window.location.href = "/rooms/" + _id;
        });
        

    }
});


