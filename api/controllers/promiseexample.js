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
   promiseTOReadFileContent.then(function(value)
  {
    console.log(value);
    console.log("all");
  })
  console.log("muthu");
   //console.log("promiseTOReadFileContent",promiseTOReadFileContent);
  /*promiseTOReadFileContent.then(function(filecontent)
  {
    console.log("file content in list_all_tasks ",filecontent);
  }).catch(function (error) {  
    console.log("Error in Reading Resume is",error.message); 
  });
 */
 // getFile(jdfilename,'JD');
}

function  getFile(filename,foldername)
{
  return new Promise(function(resolve, reject) {

    setTimeout(() => resolve(1), 1000); // (*)
  
  }).then(function(result) { // (**)
  
    console.log(result); // 1
    return result * 2;
  
  }).then(function(result) { // (***)
  
    console.log(result); // 2
    return result * 2;
  
  }).then(function(result) {
  
    console.log(result); // 4
     
      return result * 2;
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
 

 let promiseToGetResumekeyphrases = textanalyics();
        promiseToGetResumekeyphrases.then(function(JDcontent){
        }).catch(function (error) {  
          console.log("Error in Getting Resume Keyphrases is",error.message); 
        });


        seTOCallLuis 429 - "{ \"statusCode\": 429, \"message\": \"Rate limit is exceeded. Try again in 1 seconds.\" }"






        function comparekeyphrases(resumekeyphrase,luisintent,errorphrases)
{ 
  
  var resumelength = Object.keys(resumekeyphrase).length;
  //var jdlength = Object.keys(jdkeyphrase).length;
  console.log(resumekeyphrase instanceof(Array));
  console.log("lenght of the keyphrases before ",resumelength,luisintent.length);
 
var count =10;
var options4 ={};
let luisurl ="";
var currentluisintent = [];
var luisintentindex =0, errorindex=0;
for(var x=0;x<10;x++){
    console.log("keyphrase for luis is",resumekeyphrase[x]);
    luisurl="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/724c4d8e-3cc4-4c8a-8e17-0d8b52fde66e?subscription-key=cadf17401bfb4b15b24d0311e24bea77&verbose=true&timezoneOffset=0&q="+resumekeyphrase[x];
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
      currentluisintent[luisintentindex]=body_.topScoringIntent.intent;  
      luisintentindex++;
      //console.log("Luis intent is",body.topScoringIntent.intent);
    //  console.log("Luis intent after parsing is",body_.topScoringIntent.intent);
      if(luisintentindex>=count)
      {
         console.log("index ie is "+luisintentindex+" luis intent array",currentluisintent);
         

      }
    }).catch(function (err) {
    // console.log("else error is",err);
     console.log("-----------------------------------------------------------------");
     // let error = JSON.parse(err);
     // console.log("error.statusCode is",error.statusCode);
    //  if(error.statusCode == 429)
     // {
       // console.log("Error occurred Inside promiseTOCallLuis",err.message);
        errorphrases[errorindex]=err.query;  
        errorindex++;
        luisintentindex++;
        currentluisintent[luisintentindex] = "error";
        luisintentindex++;
        if(luisintentindex>=count)
        {
           console.log("index else is "+luisintentindex+" luis intent array",currentluisintent);
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