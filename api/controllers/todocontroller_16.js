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
var juice = require('juice');
var base64Img = require('base64-img');

var phrasecount = 10;
let sendgridCredentials = [];
exports.list_all_tasks =  function (req, res) {
  /*
  var filename = req.query.filename;
  //var filename = "Resume_me.docx";
  //var jdfilename ="Bigdata.pdf";
  //var filename = "mahesh.docx";
  //var filename = "ramprasad.docx";
  //var filename = "rahul.docx";
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
        //  console.log("resumephrase is", resumephrases);
          resumephrase = updatingphrases(resumephrases[0], 0);
          console.log("Updated resumephrase is", resumephrase);
          let promiseToGetJDkeyphrases = textanalyics(JDdetail,resumedetail,res);
          promiseToGetJDkeyphrases.then(function (JDphrases) {
            resumedetail = JDphrases[1];
            res = JDphrases[2];
          //  console.log("JDphrase is", JDphrases);
            JDphrase = updatingphrases(JDphrases[0], 1);
           // console.log("Updated JDphrase is", JDphrases);

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
  });*/
 // sendMail(["mprasanth113@gmail.com","test"],res);
 /*base64Img.base64('sirius_logo.png', function(err, data) {
 var base64File = new Buffer("sirius_logo.png").toString('base64');
  //data += " encoding";
 // console.log("data is ",data);
 console.log("data is ",base64File);
   sendMail(["mprasanth113@gmail.com","test"],res,base64File);
 });*/
 var base64str = base64_encode("sirius_logo.png");
 console.log("data is ",base64str);
 sendMail(["mprasanth113@gmail.com"],base64str);
}

function resolveAfter3Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("before");
      resolve('resolved');
      console.log("after");
    }, 3000);
  });
}

function resolveAfter1Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("1-before");
      resolve('resolved');
      console.log("1-after");
    }, 1000);
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
        await resolveAfter3Seconds();
      }
      await resolveAfter1Seconds();
  
    
  }
  console.log("after FIRST for loop",JDintentarray);
  resumecontent = resumedetail;
  let response = res;
  for(let b=0;b<phrasecount;b++)
  {
    
   // resumeintentarray[b] = await getIntents(resumephrase[b]);
    resumeintentarray[b] =  await getIntents(resumephrase[b]);
      console.log("REsume");
      if((b+1)%5==0)
      {
        await resolveAfter3Seconds();
      }
      await resolveAfter1Seconds();
   
  }
  console.log("after SECOND for loop",resumeintentarray);
  let total = phraseCompariosion(JDintentarray,resumeintentarray);
  //console.log("REsumecontent is",resumecontent);
  if(total >= 5)
  {
  let email = getEmailsFromString(resumecontent);
  console.log("email",email,typeof email);
  sendMail(email,response);
  }
  else{
    console.log("Candidate score is "+total+" and rejected");
    response.json({ message: 'You are rejected' });
  }
}
function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString("base64");
}


function sendMail(emails,data)
{
  //console.log("emails  is",emails[0],"type is",typeof emails);
  //console.log(" Email found in  "+filenames);
  //console.log("email is",emails);
 // console.log("email username and password",sendgridCredentials);
 /* var sendgrid = new Sendgrid({
    user: sendgridCredentials[0],//provide the login credentials
    key:sendgridCredentials[1]
  });*/
  var sendgrid = new Sendgrid({
    user: "Muthuprasanth1121",//provide the login credentials
    key:"Sirius@25",
  });
  var attach = [];

  attach.push({
    content : data,
    filename : "sirius_logo.png",
    encoding: 'base64'
  });
      /*let bitmap = fs.readFileSync("images");
      imageBase64URL = new Buffer(bitmap).toString('base64');*/
  let htmlstart="<!DOCTYPE html> <html><head><style> body {padding:10px; }"
  + ".sign{ width:1.7812in;height:0.6145in; }.hrname{margin:10px 0 0 0} .phone{color:rgb(102, 102, 102);margin:0} .web{color:rgb(48, 74, 134);} .line{margin:0 5px;} .email{color:#0000FF} </style></head><body>";
  let htmlend  = "</body></html>";
  let content = "<span> Hi, </span> <br><br> <span>Greetings from Sirius India !!</span><br>"+       
  "<p>Thank you for your interest with Sirius Computer Solutions. You have been shortlisted for <b>.NET and Azure Developer</b>. Your next round is Technical Interview with our Hiring-Bot.</p>"+
  "<p><b>Please follow the below instructions to start your Interview</b></p>"+
  "<ol>"+
      "<li>Signup/Login with Skype</li>"+
     "<li>Click<a href='https://join.skype.com/bot/9c011e01-a307-4aa5-b9a6-13b3b5df47d1'> Here</a> to start Interview</li>"+
     "<li>Once the chat window opens, say <b>Hi</b></li>"+
  "</ol>"+
  "<div><img src='content_id:myimagecid'  alt='no image found' class='sign'/></div><h4 class = 'hrname'>Human Resources</h4><p class='phone'>Office (India): +91 44 6650 7800 </p>"+
  "<span><a href='http://www.siriuscom.com' class = 'web'>www.siriuscom.com</a></span><span class='line'>|</span><span class='email'>Sirius.IndiaHR@siriuscom.com</span>";
  // "<p><a href='https://join.skype.com/bot/9c011e01-a307-4aa5-b9a6-13b3b5df47d1'>Click me</a> for the next round of Interview</p> <br><br>" +
  // "<img src='cid:testme' alt='graphic'/>";
  //+"<img src = 'data:image/png;base64,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'/>";
  let response1 = htmlstart+ "<img src='content_id:myimagecid'  alt='no image found' class='sign'/>" + htmlend;
  let response2 =  juice(response1);
  console.log(" response2 = ",response2);

  sendgrid.send({
      to: emails[0],
      from: 'mprasanth113@gmail.com',
    //   cc:"sendgriduser112@gmail.com",
      subject: 'Interview from Sirius Computer Solutions India Pvt Ltd ',
     /* content:(data | Buffer),
      filename: 'sirius_logo.png', 
      cid: 'myimagecid',
      type : 'image/png',
      disposition:"inline",
      encoding: "base64",*/
     // attachments:attach,
     attachments: [
      {
        filename: "sirius_logo.png",
        content: data,
        content_id: "myimagecid"
      }
    ],
     // cid:'myimagecid',
    /* attachments: 
        [{
        // content: Buffer,
        content: (data | Buffer),
         type : 'image/png',
         filename: 'sirius_logo.png',     
      //   path: "images",     
          // contentType:  'image/jpeg',
         disposition:"inline",
         contentId: 'myimagecid',
         
         // content:      ('yourbase64encodedimageasastringcangohere' | Buffer)
         
        },],*/
       /* files: [
          {
            filename: "sirius_logo.png",
            content: ("image" | Buffer),
            content_id: "myimagecid",
            contentType: "image/png",
            disposition:"inline",
          }
        ],*/
      /*  files: [
          {
            filename: 'GooglePay_Lockup.max_1000x1000.0.png',          // required only if file.content is used.
            url: 'https://cdn.vox-cdn.com/thumbor/2Gx0MqNg5DKbzE9sD2uTSGKFNVM=/0x0:1000x604/1200x800/filters:focal(420x222:580x382)/cdn.vox-cdn.com/uploads/chorus_image/image/58245867/GooglePay_Lockup.max_1000x1000.0.png',               // == One of these three options is required
            content: ('testme' | Buffer) //
          }
        ],*/
      /*  attachments: [
          {
             content: imageBase64URL,
             filename: 'sirius_logo.png',
             contentId: 'myimagecid',
             disposition: 'inline'
          },
       ],*/
      // html: "<h1>Hello Azure!</h1>"+"\n thank you"
      html: response2,
      // "<a href='https://join.skype.com/bot/3935f689-309f-4bea-a782-dd4fdce254b4'>Click me</a>",

  }, function (err) {
    if (err) {
      response.json({ message: 'Selected but Mail not sended and Error is'+err });
      console.log("Mail error",err);
   
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
   var luisserverurl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b9096f54-d27f-48a4-918d-d165f3ae0df7?subscription-key=ef62dce222b542b9a495f25120dc1ccc&verbose=true&timezoneOffset=0&q="+resumekeyphrase;

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
  //console.log("phrase is",phrase);
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
  if (phrase.indexOf("Azure Blob") != -1) {
    let pos = phrase.indexOf("Azure Blob");
    console.log("Azure Blob index", pos);
    phrase.splice(pos, 1);
  }
  return phrase;
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
     // 'Ocp-Apim-Subscription-Key': 'ad883f4fcd994bc190b723810ac525c5',
      'Ocp-Apim-Subscription-Key':'861ca2bd458d45e89b10575963917cec',
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
