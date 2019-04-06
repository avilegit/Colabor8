var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/newissue',function(request,response){
  //newissue is stored in body store this in mongo 
  console.log('body: ' + JSON.stringify(request.body));
  //check req form for validity or do on client its smarter
  var id = uuidv1();
  response.send(id);
});
module.exports = router;
