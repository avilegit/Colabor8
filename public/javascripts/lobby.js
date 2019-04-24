$(document).ready(function () {

    var newroom = document.getElementById('new-room-button');

    //socket = io();
    io = null;

    socket.emit('num-users-request', function(numUsers){
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
            var numberletter = /^[0-9a-zA-Z]+$/;
            if(_roomID.match(numberletter))
            {
                socket.emit('room-join-request', {roomID : _roomID},function(proceed){
                
                    console.log('got response from mongo', proceed);
                    if(proceed){
                        window.location.href = "/rooms/" + proceed.id;
                    }
                    else{
                        bootbox.alert("no matching room found: " + _roomID);
                    }
                })
            }
            else
            {
                alert("ID can only be alpha-numeric");
            }

            return false;
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


