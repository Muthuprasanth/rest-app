var fs = require("fs");
var textract = require('textract');
var natural = require('natural');
var addrs = require("email-addresses");
var Analyzer = require('natural').SentimentAnalyzer;
require('dotenv').config();
/*var spr = require("sp-request");


var sp = spr.create({username: "aravindan.uthayasuriyan@siriuscomsharepoint.onmicrosoft.com",password:"au@mar2018"});

sp.get('https://siriuscomsharepoint.sharepoint.com/_api/web/GetFileByServerRelativeUrl(\'/Shared Documents/Resume.docx\')/$value?binaryStringResponseBody=true')
.then(response => {
    console.log(response);
  })
  .catch(err =>{
    console.log(err);
  });*/

  var stemmer = require('natural').PorterStemmer;
  //var analyzzer = Analyzer("English", stemmer, "afinn")
  //console.log(analyzzer.getSentiment("I like cherries"));
var sppull = require("sppull").sppull;


  
  var context = {
      siteUrl: "https://siriuscomsharepoint.sharepoint.com",
      creds: {
        username: "aravindan.uthayasuriyan@siriuscomsharepoint.onmicrosoft.com",
        password: "au@mar2018"
      }
    };
 
  var options = {
    spRootFolder: "Shared%20Documents",
    dlRootFolder: "."
  };

  /*git add .
git commit -m "first commit"
git remote add origin https://github.com/Muthuprasanth/fileread.git
git push -u origin master*/
  /*
   * All files will be downloaded from http://contoso.sharepoint.com/subsite/Shared%20Documents/Contracts folder
   * to __dirname + /Downloads/Contracts folder.
   * Folders structure will remain original as it is in SharePoint's target folder.
  */
 
  sppull(context, options)
    .then(function(downloadResults) {
      console.log("Files are downloaded");
      textract.fromFileWithPath('Resume.docx', function( error, text ) {


        nlpParser(text);
      
      })
    })
    .catch(function(err) {
      console.log("Core error has happened", err);
    });

function nlpParser(text){
    //var tokenizer = new natural.WordTokenizer();
    //console.log(tokenizer.tokenize(text));
    var emails = GetEmailsFromString(text)
    var phones = GetPhoneFromString(text)
    console.log(emails);
    console.log(phones)
}

function GetEmailsFromString(text) {
    return text.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  }

  function GetPhoneFromString(text) {
    return text.match(/(?:\+?\d{2}[ -]?\d{3}[ -]?\d{5}|\d{4})/gi);
  }
