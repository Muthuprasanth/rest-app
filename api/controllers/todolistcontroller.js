//'use strict';
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var request = require('request');
var textract = require('textract');
var sppull = require("sppull").sppull;
var Sendgrid = require("sendgrid-web");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var https = require('https');
var PdfReader = require("pdfReader");

var requestPromise = require("request-promise");
var url = require('url');
//var async = require('asyncawait/async');
//var await = require('asyncawait/await');

/*
const babelRegister = require('babel-register');
let options = {
  plugins : ['transform-async-to-generator']
};
require('babel-polyfill');
// Register plugin for runtime compilation
babelRegister(options);
*/

var phrasecount = 10;
let sendgridCredentials = [];
exports.list_all_tasks =  function (req, res) {

  //console.log("response",res);
  /*
  let promiseToGetJDintent =  getIntents(JDphrase,[],[],phrasecount);  
              promiseToGetJDintent.then(function(JDintent){
                console.log("Inside main JDintent",JDintent,JDintent.length);
              }).catch(function (error) {  
                console.log("Error in Getting JD Intents is",error.message); 
              });
  */

  var filename = req.query.filename;

  //var filename = "Resume_me.docx";
  //var jdfilename ="Bigdata.pdf";
  //var filename = "mahesh.docx";
  //var filename = "ramprasad.docx";
 // var filename = "rahul.docx";
  var jdfilename = "Jdazure.docx";
  var sendgridCredentials = [];
  var resumedetail = "", JDdetail = "";
  var resumekeyphrase, JDkeyphrase;
  console.log("inside main function phrasecount is ", phrasecount);
  
  
  let promiseTOGetsendgridCredentials = getSendgrid(res);
  promiseTOGetsendgridCredentials.then(function (Credentials) {
    sendgridCredentials[0] = Credentials[0];
    sendgridCredentials[1] = Credentials[1];
    res = Credentials[2];
    
    console.log("sendgridCredentials is", sendgridCredentials);
    let promiseTOReadResumeContent = getFile(filename, 'Shared%20Documents', 'Resumes');
    //let promiseTOReadResumeContent = getFile(jdfilename,'Shared%20Documents','JD');
    promiseTOReadResumeContent.then(function (resumecontent) {
      resumedetail = resumecontent;
      console.log("resumedetail is", resumedetail);
      let promiseTOReadJDContent = getFile(jdfilename, 'Shared%20Documents', 'JD');
      promiseTOReadJDContent.then(function (JDcontent) {
        JDdetail = JDcontent;
        console.log("JDdetail is", JDdetail);
        let promiseToGetResumekeyphrases = textanalyics(resumedetail,resumedetail,res);
        promiseToGetResumekeyphrases.then(function (resumephrases) {
          resumedetail = resumephrases[1];
          res = resumephrases[2];
         // console.log("response_2",res);
          console.log("resumephrase is", resumephrases);
          resumephrase = updatingphrases(resumephrases[0], 0);
          console.log("Updated resumephrase is", resumephrase);
          let promiseToGetJDkeyphrases = textanalyics(JDdetail,resumedetail,res);
          promiseToGetJDkeyphrases.then(function (JDphrases) {
            resumedetail = JDphrases[1];
            res = JDphrases[2];
            console.log("JDphrase is", JDphrases);
            JDphrase = updatingphrases(JDphrases[0], 1);
            console.log("Updated JDphrase is", JDphrases);

             let promiseToGetJDintent  =  helper2(JDphrase,resumephrase,phrasecount,resumedetail,res);


          }).catch(function (error) {
            console.log("Error in Getting JD Keyphrases is", error.message);
          });
        }).catch(function (error) {
          console.log("Error in Getting Resume Keyphrases is", error.message);
        });
      }).catch(function (error) {
        console.log("Error in Getting JD content is", error.message);
      });
    }).catch(function (error) {
      console.log("Error in Getting resume content is", error.message);
    });
  }).catch(function (error) {
    console.log("Error in Getting sendgridCredentials is", error.message);
  });
  
}

function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("before");
      resolve('resolved');
      console.log("after");
    }, 3000);
  });
}

async function helper2(JDphrase,resumephrase,phrasecount,resumedetail,res)
{
  console.log("Inside helper2");
let resumecontent="";

 let JDintentarray=[],resumeintentarray=[]; 
  for(let a=0;a<phrasecount;a++)
  {
    JDintentarray[a] = await getIntents(JDphrase[a]);
    console.log("JD");
    if((a+1)%5==0)
    {
      await resolveAfter2Seconds();
    }
  }
  console.log("after FIRST for loop",JDintentarray);
  resumecontent = resumedetail;
  let response = res;
  for(let b=0;b<phrasecount;b++)
  {
    resumeintentarray[b] = await getIntents(resumephrase[b]);
    console.log("REsume");
    if((b+1)%5==0)
    {
      await resolveAfter2Seconds();
    }
  }
  console.log("after SECOND for loop",resumeintentarray);
  let total = phraseCompariosion(JDintentarray,resumeintentarray);
  console.log("REsumecontent is",resumecontent);
  if(total >= 5)
  {
  let email = getEmailsFromString(resumecontent);
  console.log("email",email,typeof email);
  sendMail(email,response);
  }
  else{
    console.log("Candidate total is "+total+"and rejected");
    response.json({ message: 'You are rejected' });
  }
}
function sendMail(emails,response)
{
  //console.log("emails  is",emails[0],"type is",typeof emails);
  //console.log(" Email found in  "+filenames);
  //console.log("email is",emails);
  console.log("email username and password",sendgridCredentials);
 var sendgrid = new Sendgrid({
        user: sendgridCredentials[0],//provide the login credentials
        key:sendgridCredentials[1]
      });
   
  sendgrid.send({
        to: emails[0],
        from: 'mprasanth113@gmail.com',
        subject: 'Interview from XXX company',
        // html: "<h1>Hello Azure!</h1>"+"\n thank you"
        html: "Hello,"+"\n Congrats! you should attend the interview with our Skype bot   "+
        "<a href='https://join.skype.com/bot/3935f689-309f-4bea-a782-dd4fdce254b4'>Click me</a>",
  }, function (err) {
    if (err) {
      console.log("Mail error",err);
      response.json({ message: 'Selected but Mail not sended' });
    } else {
      console.log("Success Mail sended From Azure ");
      response.json({ message: 'Selected and Mail sended' });
    }
  });
  //textanalyics();
}

function phraseCompariosion(JDintentarray,resumeintentarray)
{
  var JDintentsuniquecounts = {};
  var resumeintentsuniquecounts = {};
  JDintentarray.forEach(function(x) { JDintentsuniquecounts[x] = (JDintentsuniquecounts[x] || 0)+1; });
  resumeintentarray.forEach(function(x) { resumeintentsuniquecounts[x] = (resumeintentsuniquecounts[x] || 0)+1; });
  let total=0;
  for (key in JDintentsuniquecounts) {
    if (JDintentsuniquecounts.hasOwnProperty(key)) 
    {
      if(resumeintentsuniquecounts.hasOwnProperty(key))
      {
        if(resumeintentsuniquecounts[key] <= JDintentsuniquecounts[key])
        {
          console.log("key "+key+" JDintentsuniquecounts "+JDintentsuniquecounts[key]+" resumeintentsuniquecounts "+resumeintentsuniquecounts[key]);
          console.log("value "+(resumeintentsuniquecounts[key]/JDintentsuniquecounts[key])*JDintentsuniquecounts[key]);
         // total +=(resumeintentsuniquecounts[key]/JDintentsuniquecounts[key])*JDintentsuniquecounts[key];
         total += resumeintentsuniquecounts[key];
          console.log("subtotal is",total);
        }
        else{
          console.log("key "+key+" resumeintentsuniquecounts "+resumeintentsuniquecounts[key]+" is greater than  JDintentsuniquecounts "+JDintentsuniquecounts[key]);
           total += JDintentsuniquecounts[key];
           console.log("subtotal is",total);
        }
      }
      else{
        //total += 0;
        console.log("key not found "+key);
        console.log("subtotal is",total);
      }

    }
    
}
console.log("total is",total);
return total;

}

function getIntents(resumekeyphrase) {

  console.log("Inside getIntents");
  //var luisserverurl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/390a8529-08d9-4357-ba94-d9c679e383cd?subscription-key=f63fdc559ec44b90a3f4b84b46ed9de8&verbose=true&timezoneOffset=0&q=";
  //var luisserverurl ="https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/6ed560f1-638a-4937-ba81-526ae022b8b0?subscription-key=68122825e63d457f91413c632fc73cf7&verbose=true&timezoneOffset=0&q=";
  var luisserverurl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/7d934a5b-4f10-4fce-bebf-4d46fc9f0aed?subscription-key=53cb16a9965349a88b557173174a7199&verbose=true&timezoneOffset=0&q="+resumekeyphrase;

  var options4 = {
    method: 'get',
    url:luisserverurl,
  }

  return new Promise(function (resolve, reject) {
    request(options4, function (err, result, body) {
      let resultfromluis = JSON.parse(body);
      if (!("query" in resultfromluis)) {
        console.log("Inside reject");
        console.log("error is ", err);
        console.log("-----------------------------------------------------------------");
        reject(resumekeyphrase);
      }
      else {
        let body_ = JSON.parse(body);
        console.log("Inside resolve", body_);
        console.log("-----------------------------------------------------------------");
        let luisintent = body_.topScoringIntent.intent;
        resolve(luisintent);
      }
    });
  });
      
}


function updatingphrases(phrase, flag) {
  console.log("phrase is",phrase);
  var reqskills = ["AngularJs", "HTML5", "CSS3"];
  reqskills.forEach(function (entry) {
    if (phrase.indexOf(entry) != -1) {
      let pos = phrase.indexOf(entry);
      phrase.splice(pos, 1);
      phrase.unshift(entry);
    }
  });
  if (flag) {
    if (phrase.indexOf("projects") != -1) {
      let pos = phrase.indexOf("projects");
      console.log("projects index", pos);
      phrase.splice(pos, 1);
    }
  }
  return phrase;
  //console.log("After changing phrases are",phrase); 
  /*
    getIntents(resumephrase,[],[],phrasecount);  
    getIntents(JDphrase,[],[],phrasecount);  
    getIntents(resumephrase,[],[],phrasecount);  
    */
}

function textanalyics(text,resumedetail,res) {
  let body_;
  console.log("inside textanalytics");
  let documents = {
    'documents': [
      { "language": "en", 'id': '1', 'text': text },
    ]
  };
  var options3 = {
    method: 'post',
    headers: {
      'Ocp-Apim-Subscription-Key': '2437ab2f3fc04c65a3a2322e3463fca8',
      // 'Content-Type':'application/json',
      // 'Accept':'application/json',
    },
    body: JSON.stringify(documents),
    // body: documents,
    url: 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
  }
  //let promiseTOTextAnalytics = 
  return new Promise(function (resolve, reject) {
    request(options3, function (err, result, body) {
      if (err) {
        console.log("error is ", err);
        // res.json({ message: 'Error occurred in Reading a file'+ err });
      }
      else {
        // console.log("body content is",body);
        body_ = JSON.parse(body);
        // let body__ = JSON.stringify (body_, null, '  ');
        let keyphrases = body_.documents[0].keyPhrases;
        let keyphrasesarray =[];
        keyphrasesarray[0]= keyphrases;
        keyphrasesarray[1]= resumedetail;
        keyphrasesarray[2]= res;
        // console.log ("output type is", typeof keyphrases,Object.keys(keyphrases).length);  
        // console.log ("output is",body_.documents[0].keyPhrases[146]);  
        // console.log ("output keyphrases is",body_.documents[0].keyPhrases);   
        resolve(keyphrasesarray);
      }
      // var thesaurus = require("thesaurus");
      // console.log(thesaurus.find("java"));

    });
  });

}

function getFile(filename, foldername, localfolder) {
  var extname = path.extname(filename);
  console.log(extname);
  var url2 = "https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl('/" + foldername + "/" + filename + "')/$value";
  var cs = encodeURIComponent("HfH/3FQfEmE7T5rZXYYezeEYbQ0JcB+zYm7+nJdYbRY=");
  var inputs = "grant_type=client_credentials&client_id=9e03361f-4257-46fd-92e3-283725b73d2f@efd5e309-58b5-4b73-9884-fb4d0252aa8a&client_secret=" + cs + "&resource=00000003-0000-0ff1-ce00-000000000000/siriuscomsharepoint.sharepoint.com@efd5e309-58b5-4b73-9884-fb4d0252aa8a";
  var token = "";

  return new Promise(function (resolve, reject) {
    if (extname == ".txt") { //this if for getting contents form text file using Sharepoint rest API
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
          if (err) {
            console.log("err", err);
            reject(err);
            // res.json({ message: 'Error occurred in Reading a file'+ err });
          }
          else {
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
                if (err) {
                  console.log("err", err);
                  reject(err);
                  // res.json({ message: 'Error occurred in Reading a file'+ err });
                }
                else {
                  resolve(body);
                  //  nlpParser(body,filename);
                  //   res.json({ message: 'Files are downloaded' });

                }

              });
            } catch (err) {
              res.json({ message: 'Error occurred' + err });
            }
          }

        });

      } catch (err) {

        res.json({ message: 'Error occurred' + err });
      }
    }
    else { //this is for getting contents from non txt file by downloading it to the Resumes folder
      try {
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
          dlRootFolder: "./" + localfolder,
          strictObjects: [
            filename
          ]
        };
        sppull(context, options).then(function (downloadResults) {
          console.log("Files are downloaded");
          //  fs.readdir('./Resumes', function(err, items) {
          //   for (var i=0; i<items.length; i++) {
          //  console.log("path",items[i]);

          fs.stat('./' + localfolder + '/' + filename, function (err, stat) {
            if (err == null) {
              console.log('File exists');
              if (extname == ".pdf") {
                var pdftext = "";
                console.log("Its a pdf");
                new PdfReader.PdfReader().parseFileItems('./' + localfolder + '/' + filename, function (err, item) {
                  if (err) {
                    console.log("err is", err);
                    reject(err);
                  }
                  else if (!item) {
                    //console.log("pdf content is ",pdftext);
                    // textanalyics(pdftext);
                    // console.log("else ssssss is",err);
                    //console.log("pdf content is ",pdftext);
                    resolve(pdftext);
                  }
                  else if (item.text) {
                    pdftext += item.text;
                    //console.log(item.text);
                  }
                });
              }
              else {
                textract.fromFileWithPath('./' + localfolder + '/' + filename, function (error, text) {
                  //  console.log("file data",text);
                  var filePath = './' + localfolder + '/' + filename;
                  console.log("filepath is", filePath);
                  resolve(text);
                  // nlpParser(text,filename);    
                  //    fs.unlinkSync(filePath);          
                })
              }
              // res.json({ message: 'Files are downloaded' });
            } else if (err.code == 'ENOENT') {
              // file does not exist
              console.log('Some other error in elseif: ', err.code);
              reject(err);
            } else {
              console.log('Some other error: ', err.code);
              reject(err);
            }
          });

        }).catch(function (err) {
          console.log("Core error has happened", err);
          // res.json({ message: 'Core error has happened' });
          reject(err);
        });

      }//end of try
      catch (err) {
        console.log("Errrrrr", err);
        reject(err);
      }
      console.log("111eeeee");
    }
    // });
  });
}

function getSendgrid(res) {
  
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
  
  var i = 0;
  return new Promise(function (resolve, reject) {
   connection.on('connect', function (err) {
      if (err) {
        console.log(err)
        reject(err);
      }
      else {
        let tediousRequest = new Request(
          "SELECT  username,password FROM dbo.userdetails",
          function (err, rowCount, rows) {
            sendgridCredentials[2] = res;
            resolve(sendgridCredentials);
          }
        );
        tediousRequest.on('row', function (columns) {
          columns.forEach(function (column) {
            sendgridCredentials[i] = column.value;
            i++;
          });

        });
        connection.execSql(tediousRequest);
      }
    });
 
  });
}

function getEmailsFromString(text) {
  return text.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

exports.create_a_task = function (req, res) {
  //res.json({ message: 'Task successfully created' });
};


exports.read_a_task = function (req, res) {
  res.json({ message: 'Task successfully readed' });
};


exports.update_a_task = function (req, res) {
  res.json({ message: 'Task successfully updated' });
};


exports.delete_a_task = function (req, res) {
  res.json({ message: 'Task successfully deleted' });
};
