(function(){
  url = document.URL;
  do{
    var person = prompt("Enter your name", "");
  }while(person == "");

  if (person == null || person == "") {
    name = "Anon";
  } else {
    name= person;
  }
  person = "";
})();

$('#issueform').submit(function () {
  newIssue();
  //disable reload
  return false;
 });

//Query DOM
var windows = document.getElementById('chat-window'),
    output = document.getElementById('output-chat'),
    input = document.getElementById('chat-input'),
    send = document.getElementById('chat-send'),
    messages = document.getElementById('chat-messages'),
    label = document.getElementById('test-label')
    feedback = document.getElementById('feedback');

window.onload = ()=>{
  loadIssues();
}

var socket = io.connect('http://localhost:3000')

socket.on('connect', function(){
  socket.emit('join',name);
});

//listen for client join events
socket.on('join', function(new_member){
  console.log('got client name',new_member);
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + new_member + " joined!" + '</li>');
  //$('#room-members').append('<li><a>' + new_member + '</a></li>');
  //document.getElementById('room-members').innerHTML += '<li><a' + new_member + '</a></li>';
})

socket.on('disconnect', function(removed_member){
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + removed_member + " disconnected!" + '</li>');
  //$('#room-members').append('<li><a>' + new_member + '</a></li>');
  //document.getElementById('room-members').innerHTML += '<li><a' + new_member + '</a></li>';
})

socket.on('chat', function(data){
  $('#chat-messages').append('<li class="list-group-item">' + data.name + ": " + data.message + '</li>');
  feedback.innerHTML = '';
  //reset text
  input.value = '';
})

function newIssue(){
  var i_description = document.getElementById('issueDescInput').value;
  var i_severity = document.getElementById('IssueSeverityInput').value;
  var i_assignedTo = document.getElementById('IssueAssignedToInput').value;
  var i_assignedBy = name;
  var i_issueDescription = document.getElementById('IssueDescriptionInput').value;
  var i_issueStatus = 'Open';
  
  var newIssue = {
    description : i_description,
    severity : i_severity,
    assignedTo : i_assignedTo,
    assignedBy : i_assignedBy,
    issueStatus : i_issueStatus,
    issueDescription: i_issueDescription,
  }

  $.post("/newIssue/",newIssue,function(data){

      //callback
      var i_issueID = data;
      newIssue.issueID = i_issueID

      //this can be ported to mongodb for later
      if (localStorage.getItem('issues') == null) {
        var issues = [];
        issues.push(newIssue);
        localStorage.setItem('issues', JSON.stringify(issues));
      } else {
        var issues = JSON.parse(localStorage.getItem('issues'));
        issues.push(newIssue);
        localStorage.setItem('issues', JSON.stringify(issues));
      }
      
      loadIssues();

      document.getElementById('issueDescInput').value = '';
      document.getElementById('IssueAssignedToInput').value = '';
      document.getElementById('IssueDescriptionInput').value = '';
    
    });
}

function setStatusClosed(id){
  var issues = JSON.parse(localStorage.getItem('issues'));

  //gross use db next
  for(var i =0;i<issues.length;i++){
    if(issues[i].issueID == id){
      issues[i].issueStatus = 'Closed';
      issues.push(issues.splice(i,1)[0]);
      break;
    }
  }
  localStorage.setItem('issues',JSON.stringify(issues));
  loadIssues();
}

function setStatusOpen(id){
  var issues = JSON.parse(localStorage.getItem('issues'));

  //gross use db next
  for(var i =0;i<issues.length;i++){
    if(issues[i].issueID == id){
      issues[i].issueStatus = 'Open';
      issues.unshift(issues.splice(i,1)[0]);
      break;
    }
  }
  localStorage.setItem('issues',JSON.stringify(issues));
  loadIssues();
}

function deleteIssue(id){

  var issues = JSON.parse(localStorage.getItem('issues'));

  for(var i =0;i<issues.length;i++){
    if(issues[i].issueID == id){
      issues.splice(i,1);
      break;
    }
  }
  localStorage.setItem('issues',JSON.stringify(issues));
  loadIssues();
}


function loadIssues(){
  $.get("/Issues",function(Issues){
    var issuesList = document.getElementById('issue-list');

    issuesList.innerHTML = '';

    console.log("all of da issues", Issues);

    //alert(issues.length.toString())
    if(Issues.length){
      for (var i = 0; i < Issues.length; i++) {
        var id = Issues[i]._id;
        var desc = Issues[i].description;
        var severity = Issues[i].severity;
        var assignedTo = Issues[i].assignedTo;
        var status = Issues[i].issueStatus;
        var issuedesc = Issues[i].issueDescription;
        var issuesID = Issues[i].uuid;


        // TODO: add assigned by
        if(status == 'Open'){
          $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + 
                                  '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                  '<div class="card-body">' +
                                  //'<h6>Issue ID: ' + issuesID + '</h6>'+
                                  '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                  '<p><i class="fas fa-door-open"></i>' + ' '+ status + '</p>'+
                                  '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                  '<a href="#" onclick="setStatusClosed(\''+issuesID+'\')" class="btn btn-success">Close</a> '+
                                  '<a href="#" onclick="deleteIssue(\''+id+'\')" class="btn btn-danger">Delete</a>'+
                                  '</div>'+ 
                                  '<div class="card-footer">' + issuedesc + 
                                  '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + name + '</div>' +                            
                                  '</div>' + '</li>');
        }
        else{
          console.log('closed status');
          $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' + 
                                  '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                  '<div class="card-body">' +
                                  //'<h6>Issue ID: ' + issuesID + '</h6>'+
                                  '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                  '<p><i class="fas fa-door-closed"></i>' + ' '+ status + '</p>'+
                                  '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                  '<a href="#" onclick="setStatusOpen(\''+issuesID+'\')" class="btn btn-primary">Reopen</a> '+
                                  '<a href="#" onclick="deleteIssue(\''+id+'\')" class="btn btn-danger">Delete</a>'+
                                  '</div>'+ 
                                  '<div class="card-footer">' + issuedesc + 
                                  '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + name + '</div>' +                             
                                  '</div>' + '</li>');




        }
        

      }
    }
    else{
      $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + '<div class="card text-white bg-success mb-3">' +
                                  '<div class="card-body">' + 
                                  '<h5 class="card-title">' + 'No issues!' + '</h5>' + 
                                  '</div>' +                                                       
                                  '</div>' + 
                                  '</div>' + '</li>');
    }
  });


}

socket.on('typing', function(data){
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});

input.addEventListener('keypress',function(){
  socket.emit('typing', name);
})

send.addEventListener('click',function(){
  if(input.value != ''){
    socket.emit('chat', {
      message: input.value,
      name: name
    })
  }
});
