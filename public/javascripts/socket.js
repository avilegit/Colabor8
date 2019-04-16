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

 $('#searchform').submit(function () {

  issueSearch();
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

var socket = io.connect('http://localhost:3000');

socket.on('connect', function(){
  socket.emit('join',name);
});

//listen for client join events
socket.on('join', function(new_member){
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + new_member + " joined!" + '</li>');
})

socket.on('disconnect', function(removed_member){
  $('#chat-messages').append('<li class="list-group-item list-group-item-action list-group-item-warning">' + removed_member + " disconnected!" + '</li>');
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
      
      loadIssues();

      document.getElementById('issueDescInput').value = '';
      document.getElementById('IssueAssignedToInput').value = '';
      document.getElementById('IssueDescriptionInput').value = '';
    
    });
}

function issueSearch(){
  var _searchType = document.getElementById('IssueSearchType').value;
  var _searchQuery = document.getElementById('issueSearch').value;

  var querypayload = {[_searchType]:_searchQuery};

  var query = {
    payload:JSON.stringify({
      [_searchType]:_searchQuery
    })
  };

  $.post("/search", query, function(data){

    issues = data;
    loadsearchIssues(issues);

  });
  
}

function flipStatus(ID_,status_){
  var update_query = {
    uuid: ID_,
    status: status_
  };

  $.post("/updatestatus", update_query, function(data){

    loadIssues();
  });
}

function deleteIssue(ID){
  var delete_query = {uuid: ID};
  $.post("/deleteissue", delete_query, function(data){
    loadIssues();
  });
}

function loadsearchIssues(Issues){
  var issuesList = document.getElementById('issue-list');
  issuesList.innerHTML = '';


  if(Issues.length){
    for (var i = 0; i < Issues.length; i++) {
      var desc = Issues[i].description;
      var severity = Issues[i].severity;
      var assignedTo = Issues[i].assignedTo;
      var assignedBy = Issues[i].assignedBy;
      var status = Issues[i].issueStatus;
      var issuedesc = Issues[i].issueDescription;
      var issuesID = Issues[i].uuid;

      if(status == 'Open'){
        $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + 
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-open"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-success">Close</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                            
                                '</div>' + '</li>');
      }
      else{
        $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' + 
                                '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                '<div class="card-body">' +
                                '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                '<p><i class="fas fa-door-closed"></i>' + ' '+ status + '</p>'+
                                '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-primary">Reopen</a> '+
                                '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                '</div>'+ 
                                '<div class="card-footer">' + issuedesc + 
                                '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                             
                                '</div>' + '</li>');
      }
    }
  }
  else{
    $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + '<div class="card text-white bg-success mb-3">' +
                                '<div class="card-body">' + 
                                '<h5 class="card-title">' + 'No issues found!' + '</h5>' + 
                                '</div>' +                                                       
                                '</div>' + 
                                '</div>' + '</li>');
  }
}


function loadIssues(){
  $.get("/Issues",function(Issues){
    var issuesList = document.getElementById('issue-list');
    issuesList.innerHTML = '';


    if(Issues.length){
      for (var i = 0; i < Issues.length; i++) {
        var desc = Issues[i].description;
        var severity = Issues[i].severity;
        var assignedTo = Issues[i].assignedTo;
        var assignedBy = Issues[i].assignedBy;
        var status = Issues[i].issueStatus;
        var issuedesc = Issues[i].issueDescription;
        var issuesID = Issues[i].uuid;

        if(status == 'Open'){
          $('#issue-list').append('<li class="list-group-item">' + '<div class="card">' + 
                                  '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                  '<div class="card-body">' +
                                  '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                  '<p><i class="fas fa-door-open"></i>' + ' '+ status + '</p>'+
                                  '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                  '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-success">Close</a> '+
                                  '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                  '</div>'+ 
                                  '<div class="card-footer">' + issuedesc + 
                                  '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                            
                                  '</div>' + '</li>');
        }
        else{
          $('#issue-list').append('<li class="list-group-item">' + '<div class="card text-white bg-success mb-3">' + 
                                  '<div class="card-header">'+ '<h3><i class="far fa-comment-alt"></i>' + ' ' + desc + '</h3>' + '</div>' +
                                  '<div class="card-body">' +
                                  '<p><i class="fas fa-user"></i>'+ ' ' + assignedTo + '</p>'+
                                  '<p><i class="fas fa-door-closed"></i>' + ' '+ status + '</p>'+
                                  '<p><i class="fas fa-exclamation-triangle"></i>' + ' ' + severity + '</p>'+
                                  '<a href="#" onclick="flipStatus(\''+issuesID  + '\',\'' + status + '\')" class="btn btn-primary">Reopen</a> '+
                                  '<a href="#" onclick="deleteIssue(\''+issuesID+'\')" class="btn btn-danger">Delete</a>'+
                                  '</div>'+ 
                                  '<div class="card-footer">' + issuedesc + 
                                  '<p><i class="fas fa-user"></i>'+ ' assigned by: ' + assignedBy + '</div>' +                             
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

function checkSearch(){

  if(document.getElementById('issueSearch').value == ''){
    loadIssues();
  }
}
