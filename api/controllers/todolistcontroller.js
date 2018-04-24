'use strict';
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var textract = require('textract');
var sppull = require("sppull").sppull;

const Download = require('sp-download').Download;
var http = require('http');
var https = require('https');

var request = require('request');
var url = require('url');
var Sendgrid = require("sendgrid-web");

var filename ="";
exports.list_all_tasks =  function(req, res) {

//console.log(process.env.SITE_PASSWORD);
filename = req.query.filename;
var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/Shared%20Documents/"+filename+"')/$value";
console.log("filename",filename);
var context = {
  siteUrl: process.env.SITE_URL,
  creds: {
    username: process.env.SITE_USERNAME,
    password: process.env.SITE_PASSWORD
  }
};

var options = {
  spRootFolder: "Shared%20Documents",
//   dlRootFolder: "."
    dlRootFolder: "./Resumes"
};

const directory = 'Resumes';

   fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(directory, file), err => {
      if (err) throw err;
      else
      {
        console.log("Existing files deleted",file);
      }
    });
  }
});

var inputdata={
  grant_type:"client_credentials",
  client_id:"9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a",
  client_secret:"HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=",
  resource: "00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a",
}

var cs = encodeURIComponent("HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=");
var inputs="grant_type=client_credentials&client_id=9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a&client_secret="+cs+"&resource=00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a";
var token="";

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
    console.log("11");

    request(options1, function (err, result, body) {
    
      if(err){
        console.log("err",err);
        // res.json({ message: 'Error occurred in Reading a file'+ err });
      }
      else{
          body = JSON.parse(body);
          console.log("response from ",body);
          token = body.access_token;
         // console.log("first 22",token);

              try {
               //   var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/Shared%20Documents/C_locations.txt')/$value";
                  //var token ="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkZTaW11RnJGTm9DMHNKWEdtdjEzbk5aY2VEYyIsImtpZCI6IkZTaW11RnJGTm9DMHNKWEdtdjEzbk5aY2VEYyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvc2lyaXVzY29tc2hhcmVwb2ludC5zaGFyZXBvaW50LmNvbUBlZmQ1ZTMwOS01OGI1LTRiNzMtOTg4NC1mYjRkMDI1MmFhOGEiLCJpc3MiOiIwMDAwMDAwMS0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDBAZWZkNWUzMDktNThiNS00YjczLTk4ODQtZmI0ZDAyNTJhYThhIiwiaWF0IjoxNTI0NDgxNTUwLCJuYmYiOjE1MjQ0ODE1NTAsImV4cCI6MTUyNDQ4NTQ1MCwiaWRlbnRpdHlwcm92aWRlciI6IjAwMDAwMDAxLTAwMDAtMDAwMC1jMDAwLTAwMDAwMDAwMDAwMEBlZmQ1ZTMwOS01OGI1LTRiNzMtOTg4NC1mYjRkMDI1MmFhOGEiLCJuYW1laWQiOiI5ZTAzMzYxZi00MjU3LTQ2ZmQtOTJlMy0yODM3MjViNzNkMmZAZWZkNWUzMDktNThiNS00YjczLTk4ODQtZmI0ZDAyNTJhYThhIiwib2lkIjoiNDZiZTgwODEtNDhjNy00YTZhLTkzMjUtYTRlNDliN2EyODE5Iiwic3ViIjoiNDZiZTgwODEtNDhjNy00YTZhLTkzMjUtYTRlNDliN2EyODE5IiwidHJ1c3RlZGZvcmRlbGVnYXRpb24iOiJmYWxzZSJ9.ZTcz5A4D66jAiAwJbFdhnvi516SOM4Bv7KPFEzSTW6tGfX3n2unAb8QCeohxf6FR6rcPG0HjQ2v8iEylpIfv5WfYNwJXN8-aXWj69FjHIeyJfHoITUJpb9rTEKbTuq-pUj3BKKgC8krd26ojpiiAFNJ5LIJ9DtHOCd4-hqW_SmeTY65JRjTqnbCGaq8uZKBG9RlagdxTQSkKj4e_xNCk05ajhuVr6QXrKZn1PT4J9eO3o7gECBPxhxyZ-pkieTzeMub1A0KuZCFbiItdvo2IxlnSokbnBQmOtTyMpqFcNDN7rwXw36_hylqvCSIY3sc3d-DvAjWwT6oNKq66dNCXPQ";
                  var options2 = {
                    method: 'get',
                  //  body: JSON.stringify(dd),
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
                      //  body = JSON.parse(body);
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

  /* sppull(context, options)
    .then(function(downloadResults) {
      console.log("Files are downloaded");
      fs.readdir('./Resumes', function(err, items) {
         for (var i=0; i<items.length; i++) {
          console.log("path",items[i]);

          textract.fromFileWithPath('./Resumes/'+items[i], function( error, text ) {

           // res.json({ message: 'Files are downloaded' });
            //nlpParser(text);
            console.log("file data",text);
          
          })
        }
        console.log("finished");
        })
      res.json({ message: 'Files are downloaded' });
    })
    .catch(function(err) {
    //  console.log("Core error has happened", err);
       res.json({ message: 'Core error has happened' });
    });
*/

};


function nlpParser(text){
    //var tokenizer = new natural.WordTokenizer();
    //console.log(tokenizer.tokenize(text));
    var emails = GetEmailsFromString(text);
    var phones = GetPhoneFromString(text);
    console.log("file: "+filename+" email: "+emails+" "+" phones"+phones+"\n");
    //console.log(emails);
    //console.log(phones)
    sendMail(emails);
}

function sendMail(emails)
{
 var sendgrid = new Sendgrid({
        user: process.env.SENDGRID_USER,//provide the login credentials
        key:process.env.SENDGRID_PASSWORD
      });
    sendgrid.send({
    to: emails,
    from: 'mprasanth113@gmail.com',
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

 

 //res.json({ message: 'Task successfully created' });
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