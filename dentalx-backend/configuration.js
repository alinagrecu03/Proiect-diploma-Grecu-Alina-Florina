const express = require('express')
const app = express();
const cors = require('cors');
const session = require('express-session');
const port = process.env.PORT || 8080;
const NODE_ENV = "development";
const IN_PROD = NODE_ENV === "production";
const SESS_LIFETIME = 1000 * 60 * 60 * 3;
const SESS_SECRET_KEY = 'bWVkcm8='; //medro
const SESS_NAME = 'sid';
const { pool } = require('./pool');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const dirPath = path.join(__dirname, 'public/pdfs');
const multer  = require('multer');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

const postRoutes = express.Router();
const getRoutes = express.Router();
const putRoutes = express.Router();
const deleteRoutes = express.Router();

// setam storage-ul pentru fisierele pdf
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, './public/pdfs/');
  },
  // functia asta este apelata de fiecare data cand este incarcat un pdf si aici modificam numele fisierului
  filename: function (req, file, callback) {
    const today = new Date();
    const dateFormat = today.toLocaleDateString("en-GB").split("/").reverse().join("_");
    const timeFormat = today.toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit', second: '2-digit'}).split(":").join("_");
    const fileName = file.originalname.replace(".pdf", "").replace(/\s+/g, '_') + "_" + req.params.type + `_${req.params.patientId}` + "_" + dateFormat + "_" + timeFormat + ".pdf";
    callback(null, fileName);
  }
});
  
// aici apelam multer ca sa foloseasca storage-ul pe care l-am creat
const upload = multer({ storage: storage });

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(session({
    name: SESS_NAME,
    secret: SESS_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

// aici ii spunem aplicatiei backend la ce tipuri de request-uri sa se astepte si setam diferite lucruri
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});
  

module.exports = {
    express,
    app,
    port,
    SESS_LIFETIME,
    pool,
    ejs,
    path,
    fs,
    dirPath,
    multer,
    upload,
    bcrypt,
    uuidv4,
    postRoutes,
    getRoutes,
    putRoutes,
    deleteRoutes
};