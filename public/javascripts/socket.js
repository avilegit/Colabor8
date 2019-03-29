(function(){


  var person = prompt("Enter your name", "");
  if (person == null || person == "") {
    name = "Anon";
  } else {
    name= person;
    //input.placeholder = "name: "
  }
})();

console.log('name',name)
//Query DOM
var window = document.getElementById('chat-window'),
    output = document.getElementById('output-chat'),
    input = document.getElementById('chat-input'),
    send = document.getElementById('chat-send'),
    messages = document.getElementById('chat-messages')
    label = document.getElementById('test-label');

var socket = io.connect('http://localhost:3000')

socket.on('connect', function(){

  socket.emit('join',name);
  console.log('client joining', name);

});

send.addEventListener('click',function(){
  if(input.value != ''){
    socket.emit('chat', {
      message: input.value,
      name: name
    })
  }
});


//listen for client join events
socket.on('join', function(data){
  console.log('got client name',data);
  $('#chat-messages').append('<li class="list-group-item active">' + data + " joined!" + '</li>');

})

socket.on('chat', function(data){

  console.log('caught callback from server');
  $('#chat-messages').append('<li class="list-group-item active">' + data.name + ": " + data.message + '</li>');

  //reset text
  input.value = '';
})
