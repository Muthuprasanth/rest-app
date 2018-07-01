'use strict';
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var request = require('request');
var textract = require('textract');
var sppull = require("sppull").sppull;
var Sendgrid = require("sendgrid-web");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var https = require ('https');
var PdfReader = require("pdfReader");

var sendgridCredentials = [];

exports.list_all_tasks =  function(req, res) {
  //var filename = req.query.filename;
  var filename = "Resume_me.docx";
  var jdfilename ="Bigdata.pdf";
  console.log("100");
   let promiseTOReadFileContent = getFile(filename,'Shared%20Documents');
   //console.log("promiseTOReadFileContent",promiseTOReadFileContent);
  promiseTOReadFileContent.then(function(filecontent)
  {
    console.log("file content in list_all_tasks ",filecontent);
  }).catch(function (error) {  
    console.log("Error in Reading Resume is",error.message); 
  });
 
 // getFile(jdfilename,'JD');
}

function  getFile(filename,foldername)
{
  var extname = path.extname(filename);
  console.log(extname);
  var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/"+foldername+"/"+filename+"')/$value";
  var cs = encodeURIComponent("HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=");
  var inputs="grant_type=client_credentials&client_id=9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a&client_secret="+cs+"&resource=00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a";
  var token="";
  var i=0;
  //Azure SqlDB server and credentials
   var config = 
   {
     userName: 'Muthuprasanth', // update me
     password: 'Sirius@25', // update me
     server: 'textanalsisapi.database.windows.net', // update me
     options: 
        {
           database: 'textanalayserapi', //update me
           encrypt: true
        }
   }
  var connection = new Connection(config);
  console.log("102");
  //Promise starts to get the sendgrid credential from azure SqlDB
  let promiseTOGetSendgridCredential =  new Promise(function(resolve,reject){
    connection.on('connect', function(err) {
       if (err) 
       {
          console.log(err)
          reject(err);
       }
      else
       {
        let  tediousRequest = new Request(
          "SELECT  username,password FROM dbo.userdetails",
          function(err, rowCount, rows) 
            {
               console.log("103");
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
     });
    
   // sendgridCredentials[0]="Muthuprasanth112";
   // sendgridCredentials[1]="Sirius@25";
  });

  //End of getting sendgrid credential from azure SqlDB
  promiseTOGetSendgridCredential.then(function(){
    console.log("101");
   // var a="aa";
   // return a;
   // return new Promise(function(resolve,reject){ 
      console.log("102");
      console.log("sendgridCredentials---------",sendgridCredentials);
      if(extname==".txt") { //this if for getting contents form text file using Sharepoint rest API
        console.log("Its a txt file");
        try {
        var url1 = "https://accounts.accesscontrol.windows.net/efd5e309-58b5-4b73-9884-fb4d0252aa8a/tokens/OAuth/2";
        var options1 = {
          method: 'post',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", 
          },
          //body: JSON.stringify(inputdata),
          body: inputs,
          url: url1,    
        }
        request(options1, function (err, result, body) {   
          if(err){
            console.log("err",err);
            reject(err);
            // res.json({ message: 'Error occurred in Reading a file'+ err });
          }
          else{
            body = JSON.parse(body);
            token = body.access_token;
            try {
              var options2 = {
                method: 'get',             
                url: url2,
                headers: {
                  'Authorization': 'Bearer ' + token,
                },
              //  encoding: null,
              }
              request(options2, function (err, result, body) {               
                if(err){
                  console.log("err",err);
                  reject(err);
                 // res.json({ message: 'Error occurred in Reading a file'+ err });
                }
                else{
                    console.log("result meet",body);
                    //console.log(typeof(result));
                  //  resulttext = body;
                      resolve(body);
                  //  nlpParser(body,filename);
                //   res.json({ message: 'Files are downloaded' });
                  
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
      }
      else { //this is for getting contents from non txt file by downloading it to the Resumes folder
        try{
          console.log("Its a DOCX file");
          const directory = 'Resumes';
        
          var context = {
            siteUrl: process.env.SITE_URL,
            creds: {
              username: process.env.SITE_USERNAME,
              password: process.env.SITE_PASSWORD
            }
          };
            
          var options = {
            spRootFolder: foldername,
              dlRootFolder: "./Resumes",
              strictObjects: [
              filename
              ]
          };
          sppull(context, options).then(function(downloadResults) {
            console.log("Files are downloaded");
          //  fs.readdir('./Resumes', function(err, items) {
            //   for (var i=0; i<items.length; i++) {
              //  console.log("path",items[i]);

            fs.stat('./Resumes/'+filename, function(err, stat) {
                if(err == null) {
                    console.log('File exists');
                    textract.fromFileWithPath('./Resumes/'+filename, function( error, text ) {
                        console.log("file data",text);
                        var filePath = './Resumes/'+filename; 
                        console.log("filepath is",filePath);                               
                         resolve(text);
                        console.log("finished");
                      // nlpParser(text,filename);    
                    //    fs.unlinkSync(filePath);          
                      })
                //    }
                //   })
                // res.json({ message: 'Files are downloaded' });
                } else if(err.code == 'ENOENT') {
                    // file does not exist
                    console.log('Some other error in elseif: ', err.code);
                    reject(err);
                } else {
                    console.log('Some other error: ', err.code);
                    reject(err);
                }
            });
            
          }).catch(function(err) {
            console.log("Core error has happened", err);
           // res.json({ message: 'Core error has happened' });
           reject(err);
          });
      
        }//end of try
        catch(err)
        {
          console.log("Errrrrr",err);
          reject(err);
        } 
        console.log("111eeeee");
      }
   // });
  }).catch(function()
  {
    console.log("error occurred in getting sendgrid credentials");
  });
    

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
 