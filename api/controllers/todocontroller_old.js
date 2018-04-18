'use strict';
require('dotenv').config();
var fs = require("fs");
var textract = require('textract');
var sppull = require("sppull").sppull;
//var mongoose = require('mongoose'),
 // Task = mongoose.model('Tasks');

exports.list_all_tasks = function(req, res) {

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
      dlRootFolder: "."
   //     dlRootFolder: "./Resumes"
    };

    sppull(context, options)
    .then(function(downloadResults) {
      console.log("Files are downloaded");
      textract.fromFileWithPath('Resume.docx', function( error, text ) {

        res.json({ message: 'Files are downloaded' });
        //nlpParser(text);
        console.log("file data",text);
      
      })
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