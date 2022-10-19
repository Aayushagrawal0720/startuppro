const express = require("express");
const mongoose = require("mongoose");
const mongo = require("./config/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const {isAuthenticated} = require("./middleware/authFuncs");

// const port = 3000;

//    *************
//    Connect to db
//    **************

const port = process.env.PORT || 3000;

//    *************
//    Connect to db
//    **************

mongoose.connect("mongodb+srv://Ayush-startuppro:Ayush-startuppro@cluster0.bgawn.mongodb.net/Coreexpert_dev?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connected to mongodb");
});

//    **************** 
//    Initializing app
//    ****************
const app = express();
const path = require("path");

//setting paths for public,views & partials
const publicDirPath = path.join(__dirname, "/public");
const viewPath = path.join(__dirname, "/views");

//    *******************
//    M I D D L E W A R E
//    *******************

//Body Parser

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

//cookie parser
app.use(cookieParser());

// ##############
//  Setting Path
// ##############

//setting views path
app.set("views", viewPath);

//setting view engine
app.set("view engine", "ejs");

// SETTING STATIC PATHS
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "uploads_resume")));

//Middleware for sessions
app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({
    //   mongoUrl: mongo.database,
    //   collectionName: "clientsessions",
    //   ttl: 2 * 24 * 60 * 60,
    //   autoRemove: "native",
    // }),
  })
);

//Routes Setup
const routePath = require("./routes/client.js");
const editRoute = require("./routes/editData");
const addDataRoute = require("./routes/addData");
const deleteDataRoute = require("./routes/deleteData");
const getDataRoute = require("./routes/getData");
const { isStartupLoggedIn, isUserLoggedIn, isCALoggedIn, isMentorLoggedIn } = require("./middleware/authFuncs");

app.get("/", isStartupLoggedIn, isUserLoggedIn, isCALoggedIn, isMentorLoggedIn, (req, res) => {
  // const type = "Startup";
  // const loginLink = "/login/startup";
  // const showMemberOption = true;
  // res.render("homePage", { type, loginLink, showMemberOption, success:'' });
  res.redirect("/getdata/startups");
});

//get request for the contact route
app.get("/contact", (req, res) => {
  try {
    const isAuth = (req.session?.isAuth) || (req.session?.isAuthUser) || (req.session?.isAuthCA) || (req.session?.isAuthDeveloper);
    const isAuthenticated = isAuth?true:false;
    res.status(200).render("contact", {isAuthenticated});
  } catch (e) {//look for an error and if it exists, log the error
    console.log(e);
    res.status(500).send("Server Error");
  }
});


const FeedbackModel = require("./models/feedback");

app.post("/contact", async (req, res) => {
  try{
    const isAuth = (req.session?.isAuth) || (req.session?.isAuthUser) || (req.session?.isAuthCA) || (req.session?.isAuthDeveloper);
    const isAuthenticated = isAuth?true:false;
    
    
    const {p_name, p_phone, p_email, p_msg} = req.body;
    
    const new_feedback = new FeedbackModel({
      full_name: p_name,
      contact: p_phone,
      email: p_email,
      message: p_msg
    })
    
    // console.log(new_feedback);
    const saved_feedback = await new_feedback.save();
    // console.log(saved_feedback);
    
    res.status(200).render("contact", {isAuthenticated});
  }catch(e){
    // console.log(e);
    res.status(400).send(e.message);
  }
})

//get request for the about route
app.get("/about", (req, res) => {
  try {
    console.log(req.session);
    const isAuth = (req.session?.isAuth) || (req.session?.isAuthUser) || (req.session?.isAuthCA) || (req.session?.isAuthDeveloper);
    const isAuthenticated = isAuth?true:false;
    res.status(200).render("about", {isAuthenticated});
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

app.use("/", routePath);
app.use("/editData", editRoute);
app.use("/addData", addDataRoute);
app.use("/deleteData", deleteDataRoute);
app.use("/getData", getDataRoute);

//checking if the server is up and running
app.listen(port, () => {
  console.log(`Website is working! Listening on port ${port}`);
});
