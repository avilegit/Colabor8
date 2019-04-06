var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/newissue',function(request,response){
  //newissue is stored in body store this in mongo 
  //check req form for validity or do on client its smarter
  var id = uuidv1();
  newIssue = request.body;
  newIssue.id = id;
  console.log("newIssue", newIssue);

  //send back to client
  response.send(id);
});
module.exports = router;
