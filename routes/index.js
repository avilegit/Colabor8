var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/newissue',function(request,response){
  console.log('new UUID!');
  //console.log('body: ' + JSON.stringify(req.body));
  //check req form for validity or do on client its smarter
  var id = uuidv1();
  //res.set('uuid',id);
  response.send(id);

});
module.exports = router;
