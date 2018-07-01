'use strict';
require('dotenv').config();
//const cognitiveServices = require('cognitive-services');
var fs = require("fs");
var path = require('path');
var request = require('request');
var textract = require('textract');
var sppull = require("sppull").sppull;
var Sendgrid = require("sendgrid-web");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
//microsoft congnitive-services module
//const cognitiveServices = require('cognitive-services');
var https = require ('https');
var PdfReader = require("pdfReader");

var sendgridCredentials = [];
exports.list_all_tasks =  function(req, res) {
  //var filename = req.query.filename;
  var filename = "Resume_me.docx";
  var resulttext;
  console.log(filename);
  var extname = path.extname(filename);
  console.log(extname);
  var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/Shared%20Documents/"+filename+"')/$value";
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
  //Promise starts to get the sendgrid credential from azure SqlDB
  //----let promiseTOGetSendgridCredential =  new Promise(function(resolve,reject){
    /*connection.on('connect', function(err) {
       if (err) 
       {
          console.log(err)
       }
      else
       {
        let  tediousRequest = new Request(
          "SELECT  username,password FROM dbo.userdetails",
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
     });
     */
    sendgridCredentials[0]="Muthuprasanth112";
    sendgridCredentials[1]="Sirius@25";
  //---});

  //End of getting sendgrid credential from azure SqlDB
 //---- promiseTOGetSendgridCredential.then(function(){
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
                 res.json({ message: 'Error occurred in Reading a file'+ err });
              }
              else{
                  console.log("result meet",body);
                  //console.log(typeof(result));
                  resulttext = body;
                  nlpParser(body,filename);
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
          spRootFolder: "Shared%20Documents",
            dlRootFolder: "./Resumes",
            strictObjects: [
            filename
            ]
        };
        sppull(context, options)
        .then(function(downloadResults) {
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
                      
                      resulttext = text;
                      nlpParser(text,filename);    
                  //    fs.unlinkSync(filePath);          
                    })
              //    }
                  console.log("finished");
              //   })
              // res.json({ message: 'Files are downloaded' });
              } else if(err.code == 'ENOENT') {
                  // file does not exist
                  console.log('Some other error in elseif: ', err.code);
              } else {
                  console.log('Some other error: ', err.code);
              }
          });
          
      }).catch(function(err) {
          console.log("Core error has happened", err);
          res.json({ message: 'Core error has happened' });
        });
    
      }//end of try
      catch(err)
      {
        console.log("Errrrrr",err);
      } 

      console.log("111eeeee");
    }
 /* }).catch(function()
    {
      console.log("error occurred in getting sendgrid credentials");
    });
    */
}

var emails=""; 
var phones;
function nlpParser(text,filename){

  var resumekeyphrases,pdfkeyphrases;
  emails = GetEmailsFromString(text);
  phones = GetPhoneFromString(text);
  console.log("file: "+filename+" email: "+emails+" "+" phones"+phones+"\n");
  if (emails) {
  //  sendMail(emails,filename);
  }
  else
  {
    console.log("No Email found in  "+filename);
  }
  console.log("inside nlpparser");
  
  let promiseTOTextAnalytics = textanalyics(text);
  promiseTOTextAnalytics.then(function (keyphrases) {
    console.log("Inside promiseTOTextAnalytics for Resume is");
    resumekeyphrases = keyphrases;
    console.log(resumekeyphrases);

    let promiseTOReadPDF = readpdf();
    promiseTOReadPDF.then(function (pdftext) {
      console.log("Readed pdf is");
      console.log(pdftext);
      //var pdftext = readpdf(); 

      let promiseTOTextAnalyticsforpdf = textanalyics(pdftext);
      promiseTOTextAnalyticsforpdf.then(function (keyphrases) {
        pdfkeyphrases = keyphrases;
        console.log("Inside promiseTOTextAnalytics for PDF is");
        console.log(pdfkeyphrases);
          for (var key in pdfkeyphrases) {
            if (pdfkeyphrases.hasOwnProperty(key)) {
                console.log(key + " -> " + pdfkeyphrases[key]);
                console.log("-------------------------------------");
            }
          }
      }).catch(function (error) {  
        console.log("Error in PDF TextAnalytics is",error.message); 
      });

    }).catch(function (error) {  
      console.log("Error in Reading pdf is",error.message); 
    });

  }).catch(function (error) {  
    console.log("Error in Resume textanalysis is",error.message); 
  });

 //  textanalyics(text);
   //var pdftext = readpdf(); 
   //console.log("----------------------------------------------------------------------------------------------------");
   //console.log(pdftext);
   //console.log("----------------------------------------------------------------------------------------------------");
  // textanalyics(pdftext);
 
}

function sendMail(emails,filenames)
{
  //console.log("emails  is",emails[0],"type is",typeof emails);
  //console.log(" Email found in  "+filenames);
  //console.log("email is",emails);
 /*var sendgrid = new Sendgrid({
        user: sendgridCredentials[0],//provide the login credentials
        key:sendgridCredentials[1]
      });
    
  sendgrid.send({
        to: emails[0],
        from: 'mprasanth113@gmail.com',
        subject: 'Interview from XXX company'+filenames,
        // html: "<h1>Hello Azure!</h1>"+"\n thank you"
        html: "Hello,"+"\n Congrats! you should attend the interview with our Skype bot   "+
        "<a href='https://join.skype.com/bot/3935f689-309f-4bea-a782-dd4fdce254b4'>Click me</a>",
  }, function (err) {
    if (err) {
      console.log("Mail error",err);
    } else {
      console.log("Success Mail sended From Azure ");

    }
  });*/
  //textanalyics();
}
function GetEmailsFromString(text) {
  return text.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function GetPhoneFromString(text) {
  return text.match(/(?:\+?\d{2}[ -]?\d{3}[ -]?\d{5}|\d{4})/gi);
}

var textanalyticsconfig = 
   {
     textAnalytics: 
        {
          apiKey: '0621d17df5db4c1e8c4d0cacc315ab0a', //update me
          endpoint: 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
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
      'Ocp-Apim-Subscription-Key' : '0621d17df5db4c1e8c4d0cacc315ab0a',
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

function readpdf()
{
  var pdftext ="";
   console.log("pdf");
   return new Promise(function(resolve,reject){
    new PdfReader.PdfReader().parseFileItems("BigData.pdf", function(err, item){
      if (err)
        console.log("err is",err);
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




