'use strict';
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var textract = require('textract');
var sppull = require("sppull").sppull;
//var mongoose = require('mongoose'),
 // Task = mongoose.model('Tasks');

exports.list_all_tasks = async function(req, res) {

//console.log(process.env.SITE_PASSWORD);
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

 await fs.readdir(directory, (err, files) => {
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


 await  sppull(context, options)
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


};




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