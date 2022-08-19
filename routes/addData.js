const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

//Importing scheme data
const startUpScheme = require("../models/startupScheme");
const teamMemberModel = require("../models/teamMemberModel");
const jobDetailModel = require("../models/jobDetailModel");
const jobPostModel = require("../models/jobPostModel");
const appliedJobsModel = require("../models/appliedJobsModel");
const dynamicColSchemas = require("../models/dynamicCollectionSchema");
const dynamicExperienceSchema = require("../models/experienceSchema");
const timelineEventSchema = require("../models/timelineEventSchema");
const productDetailSchema = require("../models/productDetailSchema");
const pressReleaseSchema = require("../models/pressReleaseSchema");
const caModel = require("../models/CASchema");
const mentorModel = require("../models/mentorSchema");

// Middlewares
const {
  isAuth,
  isUserAuth,
  isCAAuth,
  isMentorAuth,
} = require("../middleware/authFuncs");

// SETTING up MULTER for storing UPLOADED files
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
// File filter to filter image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

// File filter to filter pdf files only
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads_resume");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype == "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadPDF = multer({ storage: pdfStorage, fileFilter: pdfFileFilter });

// Simple GET response
router.get("/", (req, res) => {
  res.send("Here we add data");
});

// ADD Startup Team Member (user) Render Page
router.get("/startup/teammember", async (req, res) => {
  try {
    res.status(200).render("memberRegister");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// ADD Startup Team Member (user) Route
router.post("/startup/teammember", async (req, res) => {
  try {
    const mid = uuidv4();
    const dataToBeAdded = {
      mid: mid,
      member_name: req.body.member_name,
      mobile_no: req.body.mobile_no,
      member_Email: req.body.member_Email,
      startupAdmin: req.body.startupAdmin,
      startupMember: req.body.startupMember,
      password: req.body.password,
      isFounder: req.body.isFounder,
      linkedin_url: req.body.linkedin_url,
    };
    const newData = new teamMemberModel(dataToBeAdded);
    // const newData = new pendingMemberModel(dataToBeAdded);
    const savedData = await newData.save();

    // console.log(savedData);
    // res.status(201).json(savedData);
    var redirectMsg =
      "Successfully Registered.\n You're now being redirected to the Login Page";
    var redirectUrl = "/login/member";
    res.status(201).render("redirectPage", { redirectMsg, redirectUrl });
  } catch (err) {
    res.status(400).send(err);
  }
});

// ADD Profile Pic Startup Render Page
router.get("/profile/startup/:uid", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    const startupData = await startUpScheme.findOne({ uid: uid });

    var p_name = startupData.startup_name;
    var p_id = startupData.uid;
    var p_picUrl = startupData.pic_url;

    var url = `/adddata/profile/startup/${p_id}`;

    res.status(200).render("profilePicAdd", { p_id, p_name, p_picUrl, url });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

// ADD Profile Pic Startup Route
router.post(
  "/profile/startup/:uid",
  isAuth,
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const uid = req.params.uid;
      const setData = await startUpScheme.findOneAndUpdate(
        { uid: req.params.uid },
        { $set: { pic_url: `/${req.file.filename}` } },
        { new: true }
      );

      // console.log(setData);
      // res.status(201).send("Uploaded");
      res.redirect("/startup/profile");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error");
    }
  }
);

// ADD Profile Pic Founder Render Page
router.get("/profile/founder/:mid", isAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const founderData = await teamMemberModel.findOne({ mid: mid });

    var p_name = founderData.member_name;
    var p_id = founderData.mid;
    var p_picUrl = founderData.pic_url;

    var url = `/adddata/profile/founder/${p_id}`;

    res.status(200).render("founderPicAdd", { p_id, p_name, p_picUrl, url });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
}
);

//ADD Profile Pic Founder Route
router.post(
  "/profile/founder/:mid",
  isAuth,
  upload.single("founder_pic"),
  async (req, res) => {
    try {
      const mid = req.params.mid;
      const setData = await teamMemberModel.findOneAndUpdate(
        { mid: req.params.mid },
        { $set: { pic_url: `/${req.file.filename}` } },
        { new: true }
      );

      // console.log(setData);
      // res.status(201).send("Uploaded");
      res.redirect("/startup/profile");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error");
    }
  }
);

// ADD Profile Pic Member/User Render Page (FOR USERS)
router.get("/profile/member/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const memberData = await teamMemberModel.findOne({ mid: mid });

    var p_id = memberData.mid;
    var p_name = memberData.member_name;
    var p_picUrl = memberData.pic_url;

    var url = `/addData/profile/member/${p_id}`;

    res.status(200).render("profilePicAdd", { p_id, p_name, p_picUrl, url });
  } catch (err) {
    res.status(500).send("Error");
  }
});

// ADD Profile Pic Member/User Route (FOR USERS)
router.post(
  "/profile/member/:mid",
  isUserAuth,
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const mid = req.params.mid;
      const setData = await teamMemberModel.findOneAndUpdate(
        { mid: mid },
        { $set: { pic_url: `/${req.file.filename}` } },
        { new: true }
      );

      // console.log(setData);
      // res.status(201).send("Uploaded");
      res.redirect("/member/profile");
    } catch (err) {
      console.log(err);
      res.status(400).send("Error");
    }
  }
);

// ADD Profile Pic CA Render Page
router.get("/profile/ca/:ca_id", isCAAuth, async (req, res) => {
  try {
    const ca_id = req.params.ca_id;
    const caData = await caModel.findOne({ ca_id: ca_id });

    var p_id = caData.ca_id;
    var p_name = caData.ca_name;
    var p_picUrl = caData.pic_url;

    var url = `/addData/profile/ca/${p_id}`;

    res.status(200).render("profilePicAdd", { p_id, p_name, p_picUrl, url });
  } catch (err) {
    res.status(500).send("Error");
  }
});

// ADD Profile Pic CA Route
router.post(
  "/profile/ca/:ca_id",
  isCAAuth,
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const ca_id = req.params.ca_id;
      const setData = await caModel.findOneAndUpdate(
        { ca_id: ca_id },
        { $set: { pic_url: `/${req.file.filename}` } },
        { new: true }
      );

      console.log(setData);
      // res.status(201).send("Uploaded");
      res.redirect("/ca/profile");
    } catch (err) {
      console.log(err);
      res.status(400).send("Error");
    }
  }
);

// ADD Profile Pic Mentor Render Page
router.get("/profile/mentor/:men_id", isMentorAuth, async (req, res) => {
  try {
    const men_id = req.params.men_id;
    const menData = await mentorModel.findOne({ men_id: men_id });

    var p_id = menData.men_id;
    var p_name = menData.men_name;
    var p_picUrl = menData.pic_url;

    var url = `/addData/profile/mentor/${p_id}`;

    res.status(200).render("profilePicAdd", { p_id, p_name, p_picUrl, url });
  } catch (err) {
    res.status(500).send("Error");
  }
});

// ADD Profile Pic Mentor Route
router.post(
  "/profile/mentor/:men_id",
  isMentorAuth,
  upload.single("profile_pic"),
  async (req, res) => {
    try {
      const men_id = req.params.men_id;
      const setData = await mentorModel.findOneAndUpdate(
        { men_id: men_id },
        { $set: { pic_url: `/${req.file.filename}` } },
        { new: true }
      );

      console.log(setData);
      // res.status(201).send("Uploaded");
      res.redirect("/mentor/profile");
    } catch (err) {
      console.log(err);
      res.status(400).send("Error");
    }
  }
);

// ADD RESUME Render Page (FOR USERS)
router.get("/resume/member/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const userData = await teamMemberModel
      .findOne({ mid: mid })
      .select({ member_name: 1 });
    var p_name = userData.member_name;
    var url = `/adddata/resume/member/${mid}`;

    res.render("resumeAdd", { p_name, url });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// ADD RESUME Route (FOR USERS)
router.post(
  "/resume/member/:mid",
  isUserAuth,
  uploadPDF.single("resume"),
  async (req, res) => {
    try {
      const mid = req.params.mid;
      const setData = await teamMemberModel.findOneAndUpdate(
        { mid: mid },
        { $set: { resume_url: `/${req.file.filename}` } },
        { new: true }
      );

      var redirectMsg =
        "Resume uploaded successfully. You will now be redirected to your profile.";
      var redirectUrl = "/member/profile";

      res.render("redirectPage", { redirectMsg, redirectUrl });
    } catch (e) {
      console.log(e);
      res.status(400).send("Error");
    }
  }
);

// ADDING JOB DETAILS Render Page (FOR USERS)
router.get("/teammember/jobdetails/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const startups = await startUpScheme
      .find()
      .select({ startup_name: 1, uid: 1 });

    res.render("jobDetailsRegister", { mid, startups });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ADDING JOB DETAILS Route (FOR USERS)
router.post("/teammember/jobdetails", isUserAuth, async (req, res) => {
  try {
    const inData = req.body;
    if (!inData.from_date) inData.from_date = Date.now();
    const dataToAdd = new jobDetailModel(inData);
    const savedData = await dataToAdd.save();
    console.log(savedData);
    res.status(201).send("Saved");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/teammember/skills/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;

    res.status(200).render("skillsAddEdit", { mid });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// ADDING JOB POSTS / ALERTS render page
router.get("/jobposts/:uid", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    res.status(200).render("jobAlertAdd", { uid });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// ADDING JOB POSTS / ALERTS
router.post("/jobposts", isAuth, async (req, res) => {
  try {
    const jid = uuidv4();
    const dataToBeSaved = req.body;
    dataToBeSaved.jid = jid;

    const newData = new jobPostModel(dataToBeSaved);
    const savedData = await newData.save();
    console.log(savedData);

    // res.status(201).json(savedData);
    res.redirect("/startup/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// APPLYING FOR JOB POSTS / ALERTS (FOR USERS)
router.post("/jobposts/apply", isUserAuth, async (req, res) => {
  try {
    const dataToBeSaved = req.body;
    dataToBeSaved.date_applied = Date.now();

    const newData = new appliedJobsModel(dataToBeSaved);
    const savedData = await newData.save();
    // console.log(savedData);

    res.status(201).json(savedData);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// ADDING EVENT TYPE DATA Render Page
router.get("/timelinegraph/type/:uid", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    const startupData = await startUpScheme.findOne({ uid: uid });

    res.status(200).render("addGraphDataType", { startupData });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// ADDING event type DATA BY CREATING COLLECTIONS DYNAMICALLY
router.post("/timelinegraph/type", isAuth, async (req, res) => {
  try {
    console.log(req.body);
    const uid = req.body.uid;
    const type_id = uuidv4();

    // CREATING COLLECTION DYNAMICALLY
    const dynamicTypeModel = new mongoose.model(
      `${uid}_typecollections`,
      dynamicColSchemas.typeSchema
    );
    const typeToBeSaved = new dynamicTypeModel({
      title: req.body.title,
      type: req.body.type,
      type_id: type_id,
      timeline: req.body.timeline,
    });
    const savedData = await typeToBeSaved.save();
    // console.log(savedData);
    // res.status(201).send(savedData);
    res.redirect(`/adddata/timelinegraph/${req.session.uid}`);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// ADDING event DATA Render Page
router.get("/timelinegraph/:uid", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    const startupData = await startUpScheme.findOne({ uid: uid });
    const dynamicTypeModel = new mongoose.model(
      `${uid}_typecollections`,
      dynamicColSchemas.typeSchema
    );
    const typesData = await dynamicTypeModel.find();

    res.status(200).render("addGraphData", { startupData, typesData });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// ADDING event DATA BY CREATING COLLECTIONS DYNAMICALLY
router.post("/timelinegraph/graphevent", isAuth, async (req, res) => {
  try {
    console.log(req.body);
    const uid = req.body.uid;
    const type_id = req.body.type_id;
    let total;

    // CREATING COLLECTION DYNAMICALLY
    const dynamicEveModel = new mongoose.model(
      `${uid}_graph_eventcollections`,
      dynamicColSchemas.typeEventSchema
    );

    // Checking previous data
    const findPrevData = await dynamicEveModel.find({ type_id: type_id });
    // console.log("Previous Data");
    // console.log(findPrevData);
    // res.json(findPrevData);
    if (findPrevData.length == 0) {
      total = req.body.diff;
    } else {
      // Condition to check if there is anm increase or decrease in data
      if (req.body.isLess == true)
        total = findPrevData[findPrevData.length - 1].total - req.body.diff;
      else total = findPrevData[findPrevData.length - 1].total + req.body.diff;
    }
    // total = req.body.diff;

    const dataToBeAdded = new dynamicEveModel({
      type_id: type_id,
      diff: req.body.diff,
      total: total,
      type_title: req.body.type_title,
      type_type: req.body.type_type,
      isLess: req.body.isLess,
      date: Date.now(),
    });
    const savedGraphEveData = await dataToBeAdded.save();
    // console.log(savedGraphEveData);

    // ADDING TIMELINE EVENT
    const dynamicTEventModel = new mongoose.model(
      `${uid}_timeline_collection`,
      timelineEventSchema
    );
    const tDataToBeAdded = new dynamicTEventModel({
      date: Date.now(),
      event_title: `Now ${req.body.type_title} are ${total}`,
    });
    const savedTData = await tDataToBeAdded.save();
    // console.log(savedTData);

    // res.status(201).send(savedGraphEveData);
    res.redirect("/startup/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
// ADDING TIMELINE EVENT DATA
router.post(
  "/timeline/:uid/timelineevent",
  isAuth,
  upload.single("event_pic"),
  async (req, res) => {
    try {
      const uid = req.params.uid;
      const dynamicEventModel = new mongoose.model(
        `${uid}_timeline_collections`,
        timelineEventSchema
      );

      let picUrl;
      if (req.file) {
        if (req.file.filename) picUrl = `/${req.file.filename}`;
        else picUrl = null;
      } else {
        picUrl = null;
      }

      const dataToBeAdded = new dynamicEventModel({
        date: req.body.date ? req.body.date : Date.now(),
        event_title: req.body.event_title,
        picUrl: picUrl,
      });
      const savedData = await dataToBeAdded.save();
      // console.log(savedData);
      // res.status(201).json("Posted press back");
      res.redirect("/startup/profile");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
);

router.post("/product/:uid/addproduct", isAuth, upload.single("event_pic"),
  async (req, res) => {
    try {
      const uid = req.params.uid;
      const dynamicProductModel = new mongoose.model(
        `${uid}_products_collections`,
        productDetailSchema
      );

      let picUrl;
      if (req.file) {
        if (req.file.filename) picUrl = `/${req.file.filename}`;
        else picUrl = null;
      } else {
        picUrl = null;
      }

      const dataToBeAdded = new dynamicProductModel({
        date: req.body.date ? req.body.date : Date.now(),
        product_title: req.body.product_title,
        picUrl: picUrl,
      });
      const savedData = await dataToBeAdded.save();
      // console.log(savedData);
      // res.status(201).json("Posted press back");
      res.redirect("/startup/profile");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  });

router.post("/press/:uid/addpress", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    console.log(req.body);
    const dynamicPressModel = new mongoose.model(
      `${uid}_press_collections`,
      pressReleaseSchema
    );



    const dataToBeAdded = new dynamicPressModel({
      job_title: req.body.job_title,
      first: req.body.first,
      second: req.body.second,
      description: req.body.description,
    });
    const savedData = await dataToBeAdded.save();
    // console.log(savedData);
    // res.status(201).json("Posted press back");
    res.redirect("/startup/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}
);

router.post("/ca/:ca_id/addexperience", async (req, res) => {
  try {
    // console.log("passing parameters");
    const ca_id = req.params.ca_id;
    const caExperienceModel = new mongoose.model(
      `${ca_id}_ca_experience_collections`,
      dynamicExperienceSchema.caExperienceSchema
    );

    const dataToBeAdded = new caExperienceModel({
      certificate_no: req.body.certificate_no,
      certificate: req.body.certificate,
      experience: req.body.experience,

    });

    const savedData = await dataToBeAdded.save();
    // console.log(savedData);
    // res.status(201).json("Posted ca experience");
    res.redirect("/ca/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}
);

router.post("/mentor/:mentor_id/addexperience", async (req, res) => {
  try {
    // console.log("passing parameters");
    const mentor_id = req.params.mentor_id;
    const mentorExperienceModel = new mongoose.model(
      `${mentor_id}_mentor_experience_collections`,
      dynamicExperienceSchema.mentorExperienceSchema
    );

    const dataToBeAdded = new mentorExperienceModel({
      resume: req.body.resume_upload,
      experience: req.body.experience,
    });

    const savedData = await dataToBeAdded.save();
    // console.log(savedData);
    // res.status(201).json("Posted mentor experience");
    res.redirect("/mentor/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}
);

router.post("/user/:user_id/addexperience", async (req, res) => {
  try {
    // console.log("passing parameters");
    const user_id = req.params.user_id;
    const userExperienceModel = new mongoose.model(
      `${user_id}_user_experience_collections`,
      dynamicExperienceSchema.userExperienceSchema
    );

    const dataToBeAdded = new userExperienceModel({
      resume: req.body.resume_upload,
      experience: req.body.experience,
    });

    const savedData = await dataToBeAdded.save();
    console.log(savedData);
    // res.status(201).json("Posted user experience");
    res.status(201).redirect("/member/profile");
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}
);

module.exports = router;
