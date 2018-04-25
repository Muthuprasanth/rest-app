'use strict';
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var textract = require('textract');
var sppull = require("sppull").sppull;

var request = require('request');
var url = require('url');
var Sendgrid = require("sendgrid-web");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var filename ="";
var sendgridCredentials = [];
exports.list_all_tasks =  function(req, res) {

filename = req.query.filename;
var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/Shared%20Documents/"+filename+"')/$value";
console.log("filename",filename);

var inputdata={
  grant_type:"client_credentials",
  client_id:"9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a",
  client_secret:"HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=",
  resource: "00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a",
}

var cs = encodeURIComponent("HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=");
var inputs="grant_type=client_credentials&client_id=9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a&client_secret="+cs+"&resource=00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a";
var token="";


var i=0;
var config = 
 {
   userName: 'Muthuprasanth', // update me
   password: 'Sirius@25', // update me
   server: 'sendgridazure.database.windows.net', // update me
   options: 
      {
         database: 'Sendgrid_DB' //update me
         , encrypt: true
      }
 }
var connection = new Connection(config);
let promiseTOGetSendgridCredential =  new Promise(function(resolve,reject){
  connection.on('connect', function(err) 
   {
     if (err) 
     {
        console.log(err)
     }
    else
     {
      let  tediousRequest = new Request(
        "SELECT  Username,Password FROM dbo.Sendgrid_Account",
        function(err, rowCount, rows) 
          {
              resolve();
          }
        );

        tediousRequest.on('row', function(columns) {
           columns.forEach(function(column) {
           sendgridCredentials[i]=column.value;
           i++;
         });
        });
        connection.execSql(tediousRequest);
     }
   }
 );

});

promiseTOGetSendgridCredential.then(function(){
  try {
      var url1 = "https://accounts.accesscontrol.windows.net/efd5e309-58b5-4b73-9884-fb4d0252aa8a/tokens/OAuth/2";
      var options1 = {
        method: 'post',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // this is not need
          //'Content-Length': inputdata.length,
      },
        //body: JSON.stringify(inputdata),
        body: inputs,
        url: url1,    
      }
      request(options1, function (err, result, body) {
      
        if(err){
          console.log("err",err);
          // res.json({ message: 'Error occurred in Reading a file'+ err });
        }
        else{
            body = JSON.parse(body);
            token = body.access_token;
           // console.log("first 22",token);

            try {
                var options2 = {
                  method: 'get',
                  url: url2,
                  headers: {
                      'Authorization': 'Bearer ' + token,
                  }

                }
             //    console.log("22",token);
                request(options2, function (err, result, body) {
                
                  if(err){
                    console.log("err",err);
                     res.json({ message: 'Error occurred in Reading a file'+ err });
                  }
                  else{
                      console.log("result meet",body);
                      //console.log(typeof(result));
                      nlpParser(body);
                      res.json({ message: 'Files are downloaded' });
                     
                  }
                  
                  });

            } catch (err) {
                 
                  res.json({ message: 'Error occurred'+ err});
                }
           
          }
        
        });

  } catch (err) {
       
      res.json({ message: 'Error occurred'+ err});
    }
}).catch(function()
{
  console.log("error occurred in gettinf sendgrid credentials");
});

};

function nlpParser(text){
    var emails = GetEmailsFromString(text);
    var phones = GetPhoneFromString(text);
    console.log("file: "+filename+" email: "+emails+" "+" phones"+phones+"\n");
    sendMail(emails);
}

function sendMail(emails)
{

 var sendgrid = new Sendgrid({
        user: sendgridCredentials[0],//provide the login credentials
        key:sendgridCredentials[1]
      });
sendgrid.send({
        to: 'mprasanth113@gmail.com',
        from: 'prasanthmurugesan212@gmail.com',
        subject: 'Azure Mail',
        html: '<h1>Hello Azure!</h1>'
  }, function (err) {
    if (err) {
      console.log("Mail error",err);
 //     session.send("Mail not send error");
    } else {
      console.log("Success Mail sended From Azure ");

   //   session.send("Mail sended From Azure ");
    }
  });

}
function GetEmailsFromString(text) {
    return text.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  }

  function GetPhoneFromString(text) {
    return text.match(/(?:\+?\d{2}[ -]?\d{3}[ -]?\d{5}|\d{4})/gi);
  }


exports.create_a_task = function(req, res) {

};

exports.read_a_task = function(req, res) {
 res.json({ message: 'Task successfully readed' });
};

exports.update_a_task = function(req, res) {
 res.json({ message: 'Task successfully updated' });
};

exports.delete_a_task = function(req, res) {

  res.json({ message: 'Task successfully deleted' });
};