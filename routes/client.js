const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");

// Importing uuid for generating uniques ids
const { v4: uuidv4 } = require("uuid");

const startUpScheme = require("../models/startupScheme");
const memberModel = require("../models/teamMemberModel");
const jobDetailModel = require("../models/jobDetailModel");
const timelineEventSchema = require("../models/timelineEventSchema");
const dynamicColSchemas = require("../models/dynamicCollectionSchema");
const dynamicExperienceSchema = require("../models/experienceSchema");
const productDetailSchema = require("../models/productDetailSchema");
const pressReleaseSchema = require("../models/pressReleaseSchema");
const caModel = require("../models/CASchema");
const mentorModel = require("../models/mentorSchema");
const contactModel = require("../models/contactUsModel");

const app = express();

// Middlewares
const {
  isAuth,
  isStartupLoggedIn,
  isUserAuth,
  isUserLoggedIn,
  isCAAuth,
  isCALoggedIn,
  isMentorAuth,
  isMentorLoggedIn,
} = require("../middleware/authFuncs");
const jobPostModel = require("../models/jobPostModel");
const { application } = require("express");

// Contact Page Form Submission Route
router.post("/contact", async (req, res) => {
  try {
    // console.log(req.body);
    const newData = new contactModel(req.body);
    const savedData = await newData.save();

    // console.log(savedData);

    var redirectMsg =
      "Thankyou for reaching out, your response has been submitted successfully. We'll connect to you shortly.";
    var redirectUrl = "/";

    res.status(201).render("redirectPage", { redirectMsg, redirectUrl });
  } catch (e) {
    res.status(400).send("Server Error");
  }
});

//Render page for register for Startups
router.get("/register/startup", async (req, res) => {
  try {
    res.render("startupRegister");
  } catch (err) {
    // console.log(err);
    res.status(500).send("Error");
  }
});

// Register Route for Startup
// This will receive both startup and founder data
router.post("/register/startup", async (req, res) => {
  try {
    // console.log("Data incoming....");
    // console.log(req.body);
    // res.send("ok");
    const startupDetails = req.body.startupDetails;
    const founderDetails = req.body.founderDetails;
    const jobDetails = req.body.jobDetails;

    // console.log(startupDetails, founderDetails);

    // GENERATING UID AND MID
    const uid = uuidv4();
    const mid = uuidv4();

    // PROCESS REGARDING STARTUP DATA
    const startupDataToBeSaved = startupDetails;
    // console.log("startupDataToBeSaved", startupDataToBeSaved);
    startupDataToBeSaved.uid = uid;
    startupDataToBeSaved.founders = [];
    startupDataToBeSaved.founders.push(mid);

    // console.log("startupDataToBeSaved", startupDataToBeSaved);

    const startup = await startUpScheme(startupDataToBeSaved);
    const savedStartupData = await startup.save();
    // console.log(savedStartupData);

    // PROCESS REGARDING FOUNDER DATA
    const founderDataToBeSaved = founderDetails;
    // console.log("founderDataToBeSaved", founderDataToBeSaved);
    founderDataToBeSaved.mid = mid;
    founderDataToBeSaved.startupAdmin = [];
    founderDataToBeSaved.startupAdmin.push(uid);
    founderDataToBeSaved.isFounder = true;

    // console.log("founderDataToBeSaved", founderDataToBeSaved);

    const founder = await memberModel(founderDataToBeSaved);
    const savedFounderData = await founder.save();
    // console.log(savedFounderData);

    // PROCESS REGARDING SAVING JOB DETAILS DATA
    const jobDataToBeSaved = jobDetails;
    jobDataToBeSaved.mid = mid;
    jobDataToBeSaved.uid = uid;
    jobDataToBeSaved.status = "Approved";
    jobDataToBeSaved.from_date = Date.now();

    const newJobData = await jobDetailModel(jobDataToBeSaved);
    const savedJobData = await newJobData.save();
    // console.log(savedJobData);

    // res.status(201).json({ status: "saved" });
    res.redirect("/login/startup");
  } catch (e) {
    res.status(400).send(e);
  }
});

// CA Register Render Page
router.get("/register/ca", async (req, res) => {
  try {
    res.status(200).render("caRegister");
  } catch (err) {
    // console.log(err);
    res.status(500).send("Error");
  }
});

// CA Register Route
router.post("/register/ca", async (req, res) => {
  try {
    const ca_id = uuidv4();
    var caData = req.body;
    caData.ca_id = ca_id;

    const dataToBeSaved = new caModel(caData);
    const savedData = await dataToBeSaved.save();
    // console.log(savedData);

    const redirectUrl = "/login/ca";
    const redirectMsg =
      "Successfully Registered!\n You're now being redirected to the Login Page";

    res.status(201).render("redirectPage", { redirectUrl, redirectMsg });
  } catch (err) {
    // console.log(err);
    res.status(400).send("Error");
  }
});

// Mentor Register Render Page
router.get("/register/mentor", async (req, res) => {
  try {
    res.status(200).render("mentorRegister");
  } catch (err) {
    // console.log(err);
    res.status(500).send("Error");
  }
});

// Mentor Register Route
router.post("/register/mentor", async (req, res) => {
  try {
    const men_id = uuidv4();
    var menData = req.body;
    menData.men_id = men_id;

    const dataToBeSaved = new mentorModel(menData);
    const savedData = await dataToBeSaved.save();
    // console.log(savedData);

    const redirectUrl = "/login/mentor";
    const redirectMsg =
      "Successfully Registered!\n You're now being redirected to the Login Page";

    res.status(201).render("redirectPage", { redirectUrl, redirectMsg });
  } catch (err) {
    // console.log(err);
    res.status(400).send("Error");
  }
});

// Render page for Startup login
router.get(
  "/login/startup",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    const type = "Startup";
    const loginLink = "/login/startup";
    const startups = await startUpScheme.find()
                        .select({startup_name: 1});
                        
    var number_of_startups = startups.length;
    const caExpData = await caModel.find()
                        .select({ca_name: 1});
                        
    var number_of_caExpData = caExpData.length;
    const mentorExpData = await mentorModel.find()
                        .select({men_name: 1});
                        
    var number_of_mentorExpData = mentorExpData.length;
    res.render("homePage", { type, loginLink,number_of_startups,number_of_caExpData, number_of_mentorExpData });
  }
);

// Route for Startup login
router.post(
  "/login/startup",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      // console.log(req.body);
      const email = await req.body.email;
      const startupData = await startUpScheme.findOne({
        email_official: email,
      });
      if (!startupData) {
        var redirectMsg =
          "Startup not found. You're being redirected back to Login Page";
        var redirectUrl = "/login/startup";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }
      // console.log(startupData);
      // console.log(startupData.startup_name, startupData.email_official);

      const resultPass = await bcrypt.compare(
        req.body.pass,
        startupData.password
      );
      if (!resultPass) {
        var redirectMsg =
          "Wrong Password. You're being redirected back to Login Page";
        var redirectUrl = "/";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      req.session.isAuth = true;
      req.session.uid = startupData.uid;
      res.redirect("/startup/profile");
      // res.redirect("/startup/profile/posts");
    } catch (e) {
      // console.log(e);
      res.status(400).send(e);
    }
  }
);

// Startup Profile Posts Page
router.get("/startup/profile/posts", isAuth, async (req, res) => {
  try {
    let founderArray = [];
    let startupFoundersArray = [];

    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find();
    // console.log(startups);

    // creating array which only has founder info
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });

    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      founderArray.push(
        new Promise((resolve, reject) => {
          memberModel
            .findOne({ mid: item[0] })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });

    founderArray = await Promise.all(founderArray);
    // console.log(founderArray);

    // FETCHING JOB DETAILS DATA OF ONLY SINGLE FOUNDER RIGHT NOW
    var jobDetailData = await jobDetailModel.findOne({
      mid: founderArray[0].mid,
    });
    if (!jobDetailData) {
      jobDetailData = { job_title: "Founder" };
    }
    // console.log(jobDetailData);

    let filterArray = [];
    startups.forEach((item) => {
      filterArray.push(item.Industry);
    });
    filterArray = [...new Set(filterArray)];
    // console.log(filterArray)

    const isLogin = true;

    return res.status(200).render("startupLoginPosts", {
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      filterArray,
    });
  } catch (e) {
    // console.log(e);
    res.status(500).send("Server Error");
  }
})

// Startup Profile
router.get("/startup/profile", isAuth, async (req, res) => {
  try {
    const uid = req.session.uid;
    const startupData = await startUpScheme.findOne({ uid: uid });

    // GETTING TIMELINE DATA
    const timelineModel = new mongoose.model(
      `${uid}_timeline_collection`,
      timelineEventSchema
    );
    const foundData = await timelineModel.find().sort({ date: -1 }).limit(5);
    // console.log(foundData);

    //Fetching PRODUCT DETAILS DATA
    const productModel = new mongoose.model(
      `${uid}_products_collection`,
      productDetailSchema
    );

    const productData = await productModel.find().sort({ date: -1 });
    // console.log(productData);

    //FETCHING PRESS RELEASE DATA
    const pressReleaseModel = new mongoose.model(
      `${uid}_press_collection`,
      pressReleaseSchema
    );

    const pressReleaseData = await pressReleaseModel.find();
    // console.log(pressReleaseData);

    // FETCHING GRAPH DATA
    let resArray = [];
    const dynamicTypeModel = new mongoose.model(
      `${uid}_typecollections`,
      dynamicColSchemas.typeSchema
    );
    const graphModel = new mongoose.model(
      `${uid}_graph_eventcollections`,
      dynamicColSchemas.typeEventSchema
    );

    const foundTypes = await dynamicTypeModel.find().where({type_of_graph:"Line Graph"});
    //  console.log(foundTypes);

    if (foundTypes.length != 0) {
      foundTypes.forEach((item, index) => {
        resArray.push(
          new Promise((resolve, reject) => {
            graphModel
              .find({ type_id: item.type_id }, { _id: 0, date: 0, })
              .sort({ date: 1 })
              .select({
                date: 1,
                diff: 1,
                isLess: 1,
                total: 1,
                type_title: 1,
                type_type: 1,
              })
              .then((data) => resolve(data))
              .catch((err) => reject(err));
          })
        );
      });
      resArray = await Promise.all(resArray);
    }

    // Checking resArray
    let emptyEls = 0;
    resArray.forEach((item) => {
      if (item.length == 0) emptyEls += 1;
    });
    if (emptyEls == resArray.length) resArray = [];

    // 
   //  console.log(JSON.stringify(resArray));
    resArray = JSON.stringify(resArray);
    const isLogin = true;

    //FETCHING BAR GRAPH DATA
    let barArray = [];
    const dynamicBarTypeModel = new mongoose.model(
      `${uid}_typecollections`,
      dynamicColSchemas.typeSchema
    );
    const bargraphModel = new mongoose.model(
      `${uid}_graph_eventcollections_bar`,
      dynamicColSchemas.bargGraphEvent
    );
    const barfoundTypes = await dynamicBarTypeModel.find().where({type_of_graph:"Bar Graph"});

    if (barfoundTypes.length != 0) {
      barfoundTypes.forEach((item, index) => {
        barArray.push(
          new Promise((resolve, reject) => {
            bargraphModel
              .find({ type_id: item.type_id }, { _id: 0, date: 0, })
              .sort({ date: 1 })
              .select({
                date: 1,
                total: 1,
                type_title: 1,
                type_type: 1,
              })
              .then((data) => resolve(data))
              .catch((err) => reject(err));
          })
        );
      });
      barArray = await Promise.all(barArray);
    }
    let baremptyEls = 0;
    barArray.forEach((item) => {
      if (item.length == 0) baremptyEls += 1;
    });
    if (baremptyEls == barArray.length) barArray = [];

    // console.log(barArray);
    const barisLogin = true;
    barArray = JSON.stringify(barArray);
    // console.log(barfoundTypes);


    // FETCHING FOUNDER DATA
    const mid = startupData.founders[0];
    const founderData = await memberModel.findOne({ mid: mid });
    // console.log(founderData);

    // FETCHING FOUNDER'S JOB DATA
    var jobDetailData = await jobDetailModel.findOne({ mid: mid });
    if (!jobDetailData) {
      jobDetailData = { job_title: "Founder" };
    }

    // FETCHING JOB ALERTS
    var jobAlerts = await jobPostModel
      .find({ uid: uid, status: { $in: ["Active", "active", "ACTIVE"] } })
      .select({ title: 1, jid: 1, employment_type: 1 })
      .limit(5);
    // console.log(jobAlerts)

    // FETCHING TEAM MEMBERS AND THEIR JOBS
    let finalTeamArray = [];

    const team = await memberModel
      .find({ startupMember: uid })
      .select({
        startupAdmin: 0,
        startupMember: 0,
        skills: 0,
        password: 0,
        mobile_no: 0,
      })
      .limit(2);

    if (team.length != 0) {
      team.forEach((item) => {
        finalTeamArray.push(
          new Promise((resolve, reject) => {
            jobDetailModel
              .findOne({ mid: item.mid })
              .select({ job_title: 1 })
              .then((data) => {
                var newObject = {};
                newObject.memberData = item;
                newObject.jobData = data;
                resolve(newObject);
              })
              .catch((e) => reject(null));
          })
        );
      });
    }

    finalTeamArray = await Promise.all(finalTeamArray);

    return res.status(200).render("startupLogin", {
      foundData,
      productData,
      pressReleaseData,
      startupData,
      resArray,  
      isLogin,
      barArray,
      founderData,
      jobDetailData,
      jobAlerts,
      finalTeamArray,
    });
  } catch (err) {
    // console.log(err);
    return res.status(500).send("Server Error");
  }
});

// Startup Logout
router.delete("/logout/startup", async (req, res) => {
  req.session.isAuth = false;
  delete req.session.uid;
  res.redirect("/login/startup");
});

// Render page for user/member login
router.get(
  "/login/member",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async(req, res) => {
    try {
      const type = "User";
      const loginLink = "/login/member";
      const startups = await startUpScheme.find()
                        .select({startup_name: 1});
                        
    var number_of_startups = startups.length;
    const caExpData = await caModel.find()
                        .select({ca_name: 1});
                        
    var number_of_caExpData = caExpData.length;
    const mentorExpData = await mentorModel.find()
                        .select({men_name: 1});
                        
    var number_of_mentorExpData = mentorExpData.length;
    res.render("homePage", { type, loginLink,number_of_startups,number_of_caExpData, number_of_mentorExpData });
    } catch (err) {
      // console.log(err);
      res.status(500).send(err);
    }
  }
);

// Route for user/member login
router.post(
  "/login/member",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      // console.log(req.body);
      const email = await req.body.email;
      const memberData = await memberModel.findOne({ member_Email: email });
      if (!memberData) {
        var redirectMsg =
          "User not found. You're being redirected back to Login Page";
        var redirectUrl = "/login/member";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }
      // console.log(memberData);

      const resultPass = await bcrypt.compare(
        req.body.pass,
        memberData.password
      );
      if (!resultPass) {
        var redirectMsg =
          "Wrong Password. You're being redirected back to Login Page";
        var redirectUrl = "/login/member";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      req.session.isAuthUser = true;
      req.session.mid = memberData.mid;
      res.redirect("/member/profile");
    } catch (err) {
      // console.log(err);
      res.status(400).send(err);
    }
  }
);

// User/Member Profile
router.get("/member/profile", isUserAuth, async (req, res) => {
  try {
    const mid = req.session.mid;
    const memberData = await memberModel.findOne({ mid: mid });

    // GETTING DETAILS OF THE USER
    var isEmployed = true;
    const userJobDetails = await jobDetailModel.findOne({
      mid: memberData.mid,
    });
    if (!userJobDetails) {
      isEmployed = false;
    }

    let founderArray = [];
    let startupFoundersArray = [];

    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find();
    // console.log(startups);

    // creating array which only has founder info
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });

    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      founderArray.push(
        new Promise((resolve, reject) => {
          memberModel
            .findOne({ mid: item[0] })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });

    founderArray = await Promise.all(founderArray);
    // console.log(founderArray);

    // FETCHING JOB DETAILS DATA OF ONLY SINGLE FOUNDER RIGHT NOW
    var jobDetailData = await jobDetailModel.findOne({
      mid: founderArray[0].mid,
    });
    if (!jobDetailData) {
      jobDetailData = { job_title: "Founder" };
    }
    // console.log(jobDetailData);

    // Fetching Experience Data of the user
    const userExpModel = new mongoose.model(
      `${mid}_user_experience_collections`,
      dynamicExperienceSchema.userExperienceSchema
    );

    const userExpData = await userExpModel.find();
    // console.log(mentorExpData);

    const isLogin = true;
    const logoutLink = "/logout/member";

    let filterArray = [];
    startups.forEach((item) => {
      filterArray.push(item.Industry);
    });
    filterArray = [...new Set(filterArray)];
    // console.log(filterArray)

    res.status(200).render("userLogin", {
      memberData,
      userExpData,
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      logoutLink,
      isEmployed,
      filterArray,
    });
  } catch (e) {
    // console.log(e);
    res.status(500).send("Server Error");
  }
});

// User/Member Logout
router.delete("/logout/member", (req, res) => {
  req.session.isAuthUser = false;
  delete req.session.mid;
  res.redirect("/login/member");
});

// CA Login Render Page
router.get(
  "/login/ca",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      const type = "CA";
      const loginLink = "/login/ca";
      const startups = await startUpScheme.find()
                        .select({startup_name: 1});
                        
    var number_of_startups = startups.length;
    const caExpData = await caModel.find()
                        .select({ca_name: 1});
                        
    var number_of_caExpData = caExpData.length;
    const mentorExpData = await mentorModel.find()
                        .select({men_name: 1});
                        
    var number_of_mentorExpData = mentorExpData.length;
      res.render("homePage", { type, loginLink, number_of_startups, number_of_caExpData, number_of_mentorExpData });
    } catch (e) {
      // console.log(e);
      res.status(500).send("Server Error");
    }
  }
);

// CA Login Route
router.post(
  "/login/ca",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      // console.log(req.body);
      const email = await req.body.email;
      const caData = await caModel.findOne({ ca_email: email });
      if (!caData) {
        var redirectMsg =
          "CA not found. You're being redirected back to Login Page";
        var redirectUrl = "/login/ca";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }
      // console.log(memberData);

      const resultPass = await bcrypt.compare(req.body.pass, caData.password);
      if (!resultPass) {
        var redirectMsg =
          "Wrong Password. You're being redirected back to Login Page";
        var redirectUrl = "/login/ca";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      req.session.isAuthCA = true;
      req.session.ca_id = caData.ca_id;
      res.redirect(`/ca/profile`);
    } catch (e) {
      // console.log(e);
      res.status(400).send("Error");
    }
  }
);

// CA Profile
router.get("/ca/profile", isCAAuth, async (req, res) => {
  try {
    const ca_id = req.session.ca_id;
    const caData = await caModel.findOne({ ca_id: ca_id });

    let founderArray = [];
    let startupFoundersArray = [];


    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find();
    // console.log(startups);

    // creating array which only has founder info
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });

    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      founderArray.push(
        new Promise((resolve, reject) => {
          memberModel
            .findOne({ mid: item[0] })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });

    founderArray = await Promise.all(founderArray);
    // console.log(founderArray);

    // FETCHING JOB DETAILS DATA OF ONLY SINGLE FOUNDER RIGHT NOW
    var jobDetailData = await jobDetailModel.findOne({
      mid: founderArray[0].mid,
    });
    if (!jobDetailData) {
      jobDetailData = { job_title: "Founder" };
    }
    // console.log(jobDetailData);

    //FETCHING EXP DATA OF CA
    const caExpModel = new mongoose.model(
      `${ca_id}_ca_experience_collections`,
      dynamicExperienceSchema.caExperienceSchema
    );

    const caExpData = await caExpModel.find();
    // console.log(caExpData);


    const isLogin = true;
    const logoutLink = "/logout/ca";

    let filterArray = [];
    startups.forEach((item) => {
      filterArray.push(item.Industry);
    });
    filterArray = [...new Set(filterArray)];
    // console.log(filterArray)

    res.status(200).render("caPage", {
      caData,
      caExpData,
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      logoutLink,
      filterArray,
    });
  } catch (e) {
    // console.log(e);
    res.status(500).send("Server Error");
  }
});

// CA Logout
router.delete("/logout/ca", async (req, res) => {
  try {
    req.session.isAuthCA = false;
    delete req.session.ca_id;
    res.redirect("/login/ca");
  } catch (e) {
    // console.log(e);
    res.status(500).send(Error);
  }
});

// Mentor Login Render Page
router.get(
  "/login/mentor",
  isStartupLoggedIn,
  isMentorLoggedIn,
  isCALoggedIn,
  isUserLoggedIn,
  async (req, res) => {
    try {
      const type = "Mentor";
      const loginLink = "/login/mentor";
      const startups = await startUpScheme.find()
                        .select({startup_name: 1});
                        
    var number_of_startups = startups.length;
    const caExpData = await caModel.find()
                        .select({ca_name: 1});
                        
    var number_of_caExpData = caExpData.length;
    const mentorExpData = await mentorModel.find()
                        .select({men_name: 1});
                        
    var number_of_mentorExpData = mentorExpData.length;
      res.render("homePage", { type, loginLink, number_of_startups, number_of_caExpData, number_of_mentorExpData });
    } catch (e) {
      // console.log(e);
      res.status(500).send("Server Error");
    }
  }
);

// Mentor Login Route
router.post(
  "/login/mentor",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      // console.log(req.body);
      const email = await req.body.email;
      const mentorData = await mentorModel.findOne({ men_email: email });
      if (!mentorData) {
        var redirectMsg =
          "Mentor not found. You're being redirected back to Login Page";
        var redirectUrl = "/login/mentor";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      const resultPass = await bcrypt.compare(
        req.body.pass,
        mentorData.password
      );
      if (!resultPass) {
        var redirectMsg =
          "Wrong Password. You're being redirected back to Login Page";
        var redirectUrl = "/login/mentor";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      req.session.isAuthMentor = true;
      req.session.men_id = mentorData.men_id;
      res.redirect("/mentor/profile");
    } catch (e) {
      // console.log(e);
      res.status(400).send("Error");
    }
  }
);

// Mentor Profile
router.get("/mentor/profile", isMentorAuth, async (req, res) => {
  try {
    const men_id = req.session.men_id;
    const mentorData = await mentorModel.findOne({ men_id: men_id });

    let founderArray = [];
    let startupFoundersArray = [];

    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find();
    // console.log(startups);

    // creating array which only has founder info
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });

    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      founderArray.push(
        new Promise((resolve, reject) => {
          memberModel
            .findOne({ mid: item[0] })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });

    founderArray = await Promise.all(founderArray);
    // console.log(founderArray);

    // FETCHING MENTOR EXP DATA
    const mentorExpModel = new mongoose.model(
      `${men_id}_mentor_experience_collections`,
      dynamicExperienceSchema.mentorExperienceSchema
    );

    const mentorExpData = await mentorExpModel.find();
    // console.log(mentorExpData);
    // console.log(mentorData);


    // FETCHING JOB DETAILS DATA OF ONLY SINGLE FOUNDER RIGHT NOW
    var jobDetailData = await jobDetailModel.findOne({
      mid: founderArray[0].mid,
    });
    if (!jobDetailData) {
      jobDetailData = { job_title: "Founder" };
    }
    // console.log(jobDetailData);

    const isLogin = true;
    const logoutLink = "/logout/mentor";

    let filterArray = [];
    startups.forEach((item) => {
      filterArray.push(item.Industry);
    });
    filterArray = [...new Set(filterArray)];
    // console.log(filterArray)

    res.status(200).render("mentorLogin", {
      mentorData,
      mentorExpData,
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      logoutLink,
      filterArray,
    });
  } catch (e) {
    // console.log(e);
    res.status(500).send("Server Error");
  }
});

// Mentor Logout
router.delete("/logout/mentor", async (req, res) => {
  try {
    req.session.isAuthMentor = false;
    delete req.session.men_id;
    res.redirect("/login/mentor");
  } catch (e) {
    // console.log(e);
    res.status(500).send(Error);
  }
});


router.get(
  "/login/developer",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    const type = "Developer";
    const loginLink = "/login/developer";
    const startups = await startUpScheme.find()
                        .select({startup_name: 1});
                        
    var number_of_startups = startups.length;
    const caExpData = await caModel.find()
                        .select({ca_name: 1});
                        
    var number_of_caExpData = caExpData.length;
    const mentorExpData = await mentorModel.find()
                        .select({men_name: 1});
                        
    var number_of_mentorExpData = mentorExpData.length;
    res.render("homePage", { type, loginLink,number_of_startups,number_of_caExpData, number_of_mentorExpData });
  }
);



const developerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isDeveloper: Boolean
}, {strict: false});
// Developer login
router.post("/login/developer",
  isStartupLoggedIn,
  isUserLoggedIn,
  isCALoggedIn,
  isMentorLoggedIn,
  async (req, res) => {
    try {
      console.log(req.body);
      const email = req.body.email;
      const pass = req.body.pass;
      
      const DeveloperModel = mongoose.model('developers', developerSchema);
      
      const developer = await DeveloperModel.findOne({ email: email });
      if (!developer) {
        var redirectMsg =
          "Developer not found. You're being redirected back to Login Page";
        var redirectUrl = "/login/developer";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      // const resultPass = await bcrypt.compare(
      //   req.body.pass,
      //   memberData.password
      // );
      if (pass !== developer.password)
      {
        var redirectMsg =
          "Wrong Password. You're being redirected back to Login Page";
        var redirectUrl = "/login/developer";
        return res
          .status(400)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      req.session.isAuthDeveloper = true;
      req.session.did = developer._id;
      res.redirect("/getdata/admin");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
);
//Developer logout
router.get('/logout/developer',(req, res) => {

  try{
    req.session.isAuthDeveloper=false;
    delete req.session.did;
    res.redirect("/login/developer");
  }catch(error){
    console.log(error);
    res.status(500).send(error);
  }
  })


module.exports = router;