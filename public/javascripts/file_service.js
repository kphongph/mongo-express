var app = angular.module('file_service', ['ngResource']);

app.factory('GridStore', function($resource) {
    var GridStore  = $resource('/gridstore/:database/:file', 
        {database:'@database',file:'@id'},{
        });           
    return GridStore;
});



