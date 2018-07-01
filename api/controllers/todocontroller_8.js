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

var requestPromise = require("request-promise");
var q = require("q");

exports.list_all_tasks =  function(req, res) {
  //var filename = req.query.filename;

  //var filename = "Resume_me.docx";
  //var jdfilename ="Bigdata.pdf";
   var filename = "mahesh.docx";
  var jdfilename ="Jdazure.docx";
  var sendgridCredentials = [];
  var resumedetail ="",JDdetail="";
  var resumekeyphrase,JDkeyphrase;
  let promiseTOGetsendgridCredentials = getSendgrid();
  promiseTOGetsendgridCredentials.then(function(Credentials){
    sendgridCredentials = Credentials;
    console.log("sendgridCredentials is",sendgridCredentials);
    let promiseTOReadResumeContent = getFile(filename,'Shared%20Documents','Resumes');
   //let promiseTOReadResumeContent = getFile(jdfilename,'Shared%20Documents','JD');
    promiseTOReadResumeContent.then(function(resumecontent){
      resumedetail = resumecontent;
      console.log("resumedetail is",resumedetail);
      let promiseTOReadJDContent = getFile(jdfilename,'Shared%20Documents','JD');
      promiseTOReadJDContent.then(function(JDcontent){
        JDdetail = JDcontent;
        console.log("JDdetail is",JDdetail);
        let promiseToGetResumekeyphrases = textanalyics(resumedetail);
        promiseToGetResumekeyphrases.then(function(resumephrase){
          console.log("resumephrase is",resumephrase);          
          let promiseToGetJDkeyphrases = textanalyics(JDdetail);
          promiseToGetJDkeyphrases.then(function(JDphrase){
            console.log("JDphrase is",JDphrase);     
            comparekeyphrases(resumephrase,[],[],10);   
            console.log("Comparision finished");   
          }).catch(function (error) {  
            console.log("Error in Getting JD Keyphrases is",error.message); 
          });
        }).catch(function (error) {  
          console.log("Error in Getting Resume Keyphrases is",error.message); 
        });
      }).catch(function (error) {  
        console.log("Error in Getting JD content is",error.message); 
      });
    }).catch(function (error) {  
      console.log("Error in Getting resume content is",error.message); 
    });
   }).catch(function (error) {  
    console.log("Error in Getting sendgridCredentials is",error.message); 
  });
}

function comparekeyphrases(resumekeyphrase,luisintent,errorphrases,count)
{ 
  
  var phraselength = Object.keys(resumekeyphrase).length;
  var luisintentlength = Object.keys(luisintent).length;

  //var jdlength = Object.keys(jdkeyphrase).length;
  console.log(resumekeyphrase instanceof(Array));
  console.log("lenght of the keyphrases before ",phraselength,luisintent.length);
 
//var count =10;
var options4 ={};
let luisurl ="";
var errorindex=0;
var promiseindex =0;
for(var x=0;x<count;x++){
    console.log("keyphrase for luis is",resumekeyphrase[x]);
    //luisurl="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/724c4d8e-3cc4-4c8a-8e17-0d8b52fde66e?subscription-key=cadf17401bfb4b15b24d0311e24bea77&verbose=true&timezoneOffset=0&q="+resumekeyphrase[x];
    luisurl="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/390a8529-08d9-4357-ba94-d9c679e383cd?subscription-key=f63fdc559ec44b90a3f4b84b46ed9de8&verbose=true&timezoneOffset=0&q="+resumekeyphrase[x];
    options4 = {
      method: 'get',
      url: luisurl,    
    }
    console.log("1");
    requestPromise(options4).then(function(body){
      console.log("2");
      let body_ = JSON.parse (body);
      console.log("Inside promiseTOCallLuis result from LUIS",body_);
      console.log("-----------------------------------------------------------------");
      luisintent[luisintentlength]=body_.topScoringIntent.intent;  
      luisintentlength++;
      promiseindex++;
      //console.log("Luis intent is",body.topScoringIntent.intent);
    //  console.log("Luis intent after parsing is",body_.topScoringIntent.intent);
      if(promiseindex>=count)
      {
         console.log("IF index  is "+promiseindex+" luis intent array",luisintent);
         if(errorindex!=0)
         {
           let errorphraselength = Object.keys(errorphrases).length;
          // setTimeout(comparekeyphrases, 7200, errorphrases,luisintent,[],errorphraselength);
          comparekeyphrases(errorphrases,luisintent,[],errorphraselength);
         }

      }
    }).catch(function (err) {
     console.log("else error is",err.statusCode);
     console.log("-----------------------------------------------------------------",resumekeyphrase[promiseindex]);
     // let error = JSON.parse(err);
     // console.log("error.statusCode is",error.statusCode);
    //  if(error.statusCode == 429)
     // {
       // console.log("Error occurred Inside promiseTOCallLuis",err.message);
        errorphrases[errorindex]=resumekeyphrase[promiseindex];  
        errorindex++;
        promiseindex++;
        if(promiseindex>=count)
        {  
          let errorphraselength = Object.keys(errorphrases).length;
           console.log("ELSE index  is "+promiseindex+" luis intent array",errorphrases);
           comparekeyphrases(errorphrases,luisintent,[],errorphraselength);
         // setTimeout(comparekeyphrases, 1200, errorphrases,luisintent,[],errorphraselength);
        }
    //  }     
    });    

 /*    
      console.log("2");
      console.log("luis api");
      if(err){
        console.log("error is ",err);
        reject(err);
        // res.json({ message: 'Error occurred in Reading a file'+ err });
      }
      else{ 
      let body_ = JSON.parse (body);
        if("statusCode" in body_ ){
          console.log("-----------------------------------------------------------------");
         // console.log("error is",body);
          reject(body);
        }
        else{
        //  console.log("result from LUIS",body);
          resolve(body);
        }
      
      //  body_ = JSON.parse (body);
      //  console.log("result from LUIS after parsing",body_);
        // let body__ = JSON.stringify (body_, null, '  ');
      // var keyphrases = body_.documents[0].keyPhrases;
      // console.log ("output type is", typeof keyphrases,Object.keys(keyphrases).length);  
      // console.log ("output is",body_.documents[0].keyPhrases[146]);  
      // console.log ("output keyphrases is",body_.documents[0].keyPhrases);   
      //  resolve(keyphrases);
      }
    });
 */ 
 /* 
  promiseTOCallLuis.then(function(body){
   let body_ = JSON.parse (body);
  //  console.log("Inside promiseTOCallLuis result from LUIS",body_);
    console.log("body.topScoringIntent is",body_.topScoringIntent.intent);
    luisintent[x]=body_.topScoringIntent.intent;  
    if(2==count)
    {
     console.log("luis intent array",luisintent[0],luisintent[1]);
    }
  }).catch(function (error) {  
    console.log("Inside promiseTOCallLuis error is",error);
    //console.log("Error in Getting sendgridCredentials is",error.message); 
  });
*/
}

}


function textanalyics(text)
{
  let body_;
  console.log("inside textanalytics");
  let documents = { 'documents': [
    { "language": "en",'id': '1', 'text': text }, 
   ]};
 var options3 = {
    method: 'post',
    headers : {
      'Ocp-Apim-Subscription-Key' : 'b9b0204a1c85458f93efca616602dc55',
     // 'Content-Type':'application/json',
     // 'Accept':'application/json',
    },
    body: JSON.stringify(documents),
   // body: documents,
    url: 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',    
  }
  //let promiseTOTextAnalytics = 
   return new Promise(function(resolve,reject){
      request(options3, function (err, result, body) {   
        if(err){
          console.log("error is ",err);
          // res.json({ message: 'Error occurred in Reading a file'+ err });
        }
        else{ 
         // console.log("body content is",body);
          body_ = JSON.parse (body);
          // let body__ = JSON.stringify (body_, null, '  ');
          var keyphrases = body_.documents[0].keyPhrases;
         // console.log ("output type is", typeof keyphrases,Object.keys(keyphrases).length);  
         // console.log ("output is",body_.documents[0].keyPhrases[146]);  
         // console.log ("output keyphrases is",body_.documents[0].keyPhrases);   
          resolve(keyphrases);
        }
        // var thesaurus = require("thesaurus");
        // console.log(thesaurus.find("java"));
        
      });
  });

}

function  getFile(filename,foldername,localfolder)
{
  var extname = path.extname(filename);
  console.log(extname);
  var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/"+foldername+"/"+filename+"')/$value";
  var cs = encodeURIComponent("HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=");
  var inputs="grant_type=client_credentials&client_id=9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a&client_secret="+cs+"&resource=00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a";
  var token="";

  return new Promise(function(resolve,reject){ 
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
            dlRootFolder: "./"+localfolder,
            strictObjects: [
            filename
            ]
        };
        sppull(context, options).then(function(downloadResults) {
          console.log("Files are downloaded");
        //  fs.readdir('./Resumes', function(err, items) {
          //   for (var i=0; i<items.length; i++) {
            //  console.log("path",items[i]);

          fs.stat('./'+localfolder+'/'+filename, function(err, stat) {
              if(err == null) {
                  console.log('File exists');
                  if(extname==".pdf")
                  {
                    var pdftext ="";
                    console.log("Its a pdf");
                    new PdfReader.PdfReader().parseFileItems('./'+localfolder+'/'+filename, function(err, item){
                      if (err)
                      {
                        console.log("err is",err);
                        reject(err);
                      }
                      else if (!item)
                      {
                        //console.log("pdf content is ",pdftext);
                      // textanalyics(pdftext);
                      // console.log("else ssssss is",err);
                        //console.log("pdf content is ",pdftext);
                        resolve(pdftext);
                      }
                      else if (item.text)
                      {
                        pdftext += item.text; 
                        //console.log(item.text);
                      }
                    });
                  }
                  else
                  {
                    textract.fromFileWithPath('./'+localfolder+'/'+filename, function( error, text ) {
                      //  console.log("file data",text);
                        var filePath = './'+localfolder+'/'+filename; 
                        console.log("filepath is",filePath);                               
                          resolve(text);
                      // nlpParser(text,filename);    
                    //    fs.unlinkSync(filePath);          
                      })
                  }
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
  });   
}

function getSendgrid()
{
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
  let sendgridCredentials = [];
  var i=0;
  return new Promise(function(resolve,reject){
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
                resolve(sendgridCredentials);
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
 