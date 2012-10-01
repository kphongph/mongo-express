var mongodb = require('mongodb');
var config = require('../config');
/*
exports.listFile = function(req, res, next) {
  var file_list = [];
  console.log('requesting list files');
  mongodb.GridStore.list(req.db, 'csv', function(err, items) {
    items.forEach(function(filename) {
      file_list.push({'name':filename});
    });
    res.json(file_list);
  });
};
*/

exports.listFile = function(req, res, next) {  
  // req.params [year, element, type, item]  
  console.log('listFile ');
  req.database.collection('fs.files', function(err, collection) {
    if(err) {            
      console.log("Error :"+err);
      res.json({success:false,message:err});              
    }
    
    collection.find().toArray(function(err, docs) {
        if(err) {
          res.json({success:false,message:err});              
        }
        //console.log(docs);
        res.json(docs); 
        //res.json({success:true,doc:docs});           
    });            
  });                    
};

/*
exports.getFile = function(req, res, next) {

  var stream = req.gridfile.stream(true);

  // Register events
  stream.on("data", function(chunk) {
    // Record the length of the file    
    console.log("read data "+chunk.length);
  });

  stream.on("end", function() {
    // Record the end was called
    console.log("end");
  });
  res.end();
};
*/

exports.getFile = function(req, res, next) {
    //var gridStore = new mongodb.GridStore(req.database, mongodb.ObjectID,req.files.file.name, 'w');
    if (req.params.file.length == 24) {
    //Convert id string to mongodb object ID
	try {
	    id = new mongodb.ObjectID.createFromHexString(req.params.file);
	    var gridStore = new mongodb.GridStore(req.db, id, 'r');
	    gridStore.open(function(err, gs) {
		gs.collection(function(err, collection) {
		    collection.find({_id:id}).toArray(function(err,docs) {
			var doc = docs[0];
			console.log(doc.filename);
			var stream = gs.stream(true);
			res.setHeader('Content-dispostion', 'attachment;filename='+doc.filename);
			res.setHeader('Content-type',doc.contentType);
			stream.on("data", function(chunk) {
			    res.write(chunk);
			});
		
			stream.on("end", function() {
			    res.end();
			});
		    });
		});
	    });
	} catch (err) {
	}
    }    
    console.log('getFile '+req.params.file);
};



exports.storeFile = function(req, res, next) {
  console.log(req.files.file);
  console.log("db"+req.db);
  if(req.files.file) {  
    var gridStore = new mongodb.GridStore(req.db, new mongodb.ObjectID(),req.files.file.name, 'w', {content_type:req.files.file.type,metadata: {'title':req.body.title}});    
    //var gridStore = new mongodb.GridStore(req.db, new mongodb.ObjectID(),req.files.file.name, 'w', {root:'csv'});
    console.log(req.files.file);
    /*
    gridStore.open(function(err, gridStore) {
      gridStore.writeFile(req.files.file.path, function(err, doc) {                
        if(err) {
          console.log(err);
          res.send(JSON.stringify({success:false}));              
        }

        gridStore.close(function(err, result) {
          if(err) {
            console.log(err);
            res.send(JSON.stringify({success:false}));              
          }
          console.log("Success!");
          res.send(JSON.stringify({success:true}));  
        });
      });
    });
    */
      gridStore.open(function(err, gridStore) {
      gridStore.writeFile(req.files.file.path, function(err, doc) {                
        if(err) {          
          res.send(JSON.stringify({success:false,message:err}));              
        }

        gridStore.close(function(err, result) {
          if(err) {            
            res.send(JSON.stringify({success:false,message:err}));              
          }
          console.log(JSON.stringify(result));
          res.send(JSON.stringify({success:true, doc:result}));                          
        });
      });
    });   
  }
};

exports.deleteFile = function(req, res, next) {
    console.log('deleteFile '+req.params.file);
    if (req.params.file.length == 24) {
        try {
            id = new mongodb.ObjectID.createFromHexString(req.params.file);
            mongodb.GridStore.exist(req.db, id, function(err, exist) {   
                if(exist) {
                    var gridStore = new mongodb.GridStore(req.database, id, 'w');
                    gridStore.open(function(err, gs) {                        
                        gs.unlink(function(err, result) { 
                            if(!err) {                              
                                res.json({'delete':req.params.file}); 
                                //client.close();                                        
                            } else {
                                console.log(err);
                            }
                        });                        
                        /*
                        gs.collection(function(err, collection){
                            collection.find({_id:id}).toArray(function(err,docs){
                                var doc = docs[0];
                                console.log(doc.filename);
                                var streame = gs.stream(true);
                            });
                        });
                        */
                    });//gridStore.open()
                } else {
                    console.log(id +' does not exists');
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};



