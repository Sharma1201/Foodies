require('dotenv').config();
const express = require('express');
const initWebRoutes = require("./routes/web");
const pageRouter = require('./routes/pages');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const connectFlash = require("connect-flash");
const passport = require("passport");
const fs = require("fs");


let app = express();

//use cookie parser
app.use(cookieParser('secret'));

//config session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 86400000 1 day
    }
}));

// Enable body parser post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));


 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'ejs');



//Enable flash message
app.use(connectFlash());

//Config passport middleware
app.use(passport.initialize());
app.use(passport.session());

// init all web routes
initWebRoutes(app);
app.use('/', pageRouter);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/blogs.ejs");
  });
  
  app.get("/video", function (req, res) {
    
    console.log(req.headers);
  
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }
  
    // get video stats (about 11MB)
    const videoPath = "video.mp4";
    const videoSize = fs.statSync(videoPath).size;
    console.log(videoSize)
  
    // Parse Range
    // Example: 'bytes=6750208-'
    const CHUNK_SIZE = 5 * 10 ** 5; // ~500 KB => 500000 Bytes
    const start = Number(range.replace(/\D/g, ""));// 'bytes=6750208-' => 6750208
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    console.log(start,end);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
  });
  
  
  



let port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Building a login system with NodeJS is running on port ${port}!`));
