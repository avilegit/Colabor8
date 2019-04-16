$(document).ready(function () {

    var newroom = document.getElementById('new-room-button');

    socket = io();
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

    newroom.addEventListener('click', function(){
        newRoom();
    });

    function newRoom(){
        socket.emit('new-room',function(_id){
            window.location.href = "/rooms/" + _id;
        });
        

    }
});


