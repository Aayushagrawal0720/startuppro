const express = require("express");
const session = require("express-session");
const router = express.Router();
const mongoose = require("mongoose");

// Importing scheme data
const startUpScheme = require("../models/startupScheme");
const membersModel = require("../models/teamMemberModel");
const jobDetailModel = require("../models/jobDetailModel");
const jobPostModel = require("../models/jobPostModel");
const appliedJobsModel = require("../models/appliedJobsModel");
const timelineEventSchema = require("../models/timelineEventSchema");
const caModel = require("../models/CASchema");
const mentorModel = require("../models/mentorSchema");

// Simple GET response
router.get("/", (req, res) => {
  res.send("Here we edit data");
});

// Middlewares
const {
  isAuth,
  isUserAuth,
  isCAAuth,
  isMentorAuth,
} = require("../middleware/authFuncs");

// Startup Basic Details Render Page
router.get("/startup/:uid/basicdetails", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    const startupData = await startUpScheme.findOne({ uid: uid });
    const isAuth = (req.session?.isAuth);

    res.status(200).render("startupDetailsEdit", {isAuth, startupData });
  } catch (err) {
    //console.log(err);
    res.status(500).send("Server Error");
  }
});

// Startup Basic Details Route
router.post("/startup/:uid/basicdetails", isAuth, async (req, res) => {
  try {
    //console.log("Hello");
    const uid = req.params.uid;
    const values = Object.keys(req.body);

    // UPDATING IN startups COLLECTION
    const updatedData = await startUpScheme.findOneAndUpdate(
      { uid: uid },
      { $set: req.body },
      { new: true },
      (err, doc) => {
        if (err) return //console.log(err);
        // //console.log(doc);
      }
    );

    // CHECKING IF DATA IS UPDATED OR NOT
    values.forEach((value) => {
      if (req.body.value != updatedData.value) {
        res.status(400).send("Not updated");
        return;
      }
    });

    //console.log(updatedData);

    // res.status(200).send("Updated");
    res.redirect("/startup/profile");
  } catch (err) {
    res.status(400).send(err);
  }
});

// Team Member Details Edit Render Page
router.get("/member/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const isAuthUser = (req.session?.isAuthUser);
    const memberData = await membersModel.findOne({ mid: mid });

    res.status(200).render("founderDetailsEdit", { memberData,isAuthUser });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Team Member Details Edit Route
router.post("/member/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const values = Object.keys(req.body);

    // UPDATING DATA IN teamMembers COLLECTION
    const updatedData = await membersModel.findOneAndUpdate(
      { mid: mid },
      { $set: req.body },
      { new: true },
      (err, doc) => {
        if (err) return //console.log(err);
      }
    );

    // CHECKING IF DATA IS UPDATED OR NOT
    values.forEach((value) => {
      if (req.body.value != updatedData.value) {
        res.status(400).send("Not updated");
        return;
      }
    });

    // //console.log(updatedData);

    // res.status(200).send("Updated");
    res.redirect("/member/profile");
  } catch (err) {
    res.status(400).send(err);
  }
});

// Change status of Job Details set by the Team Member
router.post("/startup/teammember/changestatus", isAuth, async (req, res) => {
  try {
    const mid = req.headers.mid;
    const updatedData = await jobDetailModel.findOneAndUpdate(
      { mid: mid },
      { $set: { status: req.body.status } },
      { new: true }
    );

    //console.log(updatedData);

    if (req.body.status == "Approved") {
      const foundMemberData = await membersModel.findOne({ mid: mid });

      // ADDING TIMELINE EVENT
      const dynamicTEventModel = new mongoose.model(
        `${updatedData.uid}_timeline_collection`,
        timelineEventSchema
      );
      const tDataToBeAdded = new dynamicTEventModel({
        date: Date.now(),
        event_title: `${foundMemberData.member_name} joined as member`,
      });
      const savedTData = await tDataToBeAdded.save();
      //console.log(savedTData);
    }
    res.status(201).send("Updated status in Job Details Collection");
  } catch (err) {
    res.status(400).send(err);
  }
});

// EDIT JOB DETAILS SET BY TEAM MEMBER Render Page (WILL BE EDITIED BY USER / TEAM MEMBER)
router.get("/teammember/editDetails/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const jobDetailData = await jobDetailModel.findOne({ mid: mid });
    const startups = await startUpScheme.find();
    const isAuthUser = (req.session?.isAuthUser);

    res.status(201).render("jobDetailsEdit", {isAuthUser, jobDetailData, startups, mid });
  } catch (e) {
    //console.log(e);
    res.status(500).send("Server Error");
  }
});

// EDIT JOB DETAILS SET BY TEAM MEMBER Route (WILL BE EDITIED BY USER / TEAM MEMBER)
router.post("/teammember/jobdetails", isUserAuth, async (req, res) => {
  try {
    const mid = req.body.mid;
    const oldData = await jobDetailModel.findOne({ mid: mid });
    if (oldData.uid != req.body.uid) {
      req.body.status = "Pending";
    }

    const newData = await jobDetailModel.findOneAndUpdate(
      { mid: mid },
      { $set: req.body },
      { new: true }
    );

    res.redirect("/member/profile");
  } catch (e) {
    //console.log(e);
    res.status(400).send(e);
  }
});

// EDIT JOB POST / ALERT
router.post("/jobposts", isAuth, async (req, res) => {
  try {
    const jid = req.headers.jid;
    const updateData = await jobPostModel.findOneAndUpdate(
      { jid: jid },
      { $set: req.body },
      { new: true }
    );
    //console.log(updateData);
    res.status(200).json(updateData);
  } catch (err) {
    //console.log(err);
    res.status(400).send(err);
  }
});

// CHANGE STATUS OF JOB POST / ALERT SET BY COMPANY
router.post("/jobposts/changestatus", isAuth, async (req, res) => {
  try {
    const jid = req.headers.jid;
    const updateData = await jobPostModel.findOneAndUpdate(
      { jid: jid },
      { $set: { status: req.body.status } },
      { new: true }
    );
    //console.log(updateData);
    res.status(200).send("Updated Status");
  } catch (err) {
    //console.log(err);
    res.status(200).send(err);
  }
});

// CHANGE STATUS OF APPLIED CANDIDATES
router.post("/jobposts/apply/changestatus", isAuth, async (req, res) => {
  try {
    const mid = req.headers.mid;
    const jid = req.headers.jid;
    const status = req.body.status;

    const updatedData = await appliedJobsModel.findOneAndUpdate(
      { mid: mid, jid: jid },
      { $set: { status: status } },
      { new: true }
    );
    // //console.log(updatedData);

    // IF CANDIDATE IS HIRED THEN MODIFY CANDIDATE DATA AND ADD JOB DETAILS DATA
    if (status == "Hired") {
      const uidData = [updatedData.uid];
      const updatedMemberData = await membersModel.findOneAndUpdate(
        { mid: mid },
        { $set: { startupMember: uidData } },
        { new: true }
      );
      //console.log(updatedMemberData);
      const foundJobPost = await jobPostModel.findOne({ jid: updatedData.jid });
      const job_title = foundJobPost.title;
      const detailDataToBeSaved = {
        uid: updatedData.uid,
        mid: mid,
        job_title: job_title,
        status: "Approved",
        from_date: Date.now(),
      };
      const jobDetailData = new jobDetailModel(detailDataToBeSaved);
      const savedJobDetail = await jobDetailData.save();

      // ADDING TIMELINE EVENT
      const dynamicTEventModel = new mongoose.model(
        `${updatedData.uid}_timeline_collection`,
        timelineEventSchema
      );
      const tDataToBeAdded = new dynamicTEventModel({
        date: Date.now(),
        event_title: `${updatedMemberData.member_name} joined as member`,
      });
      const savedTData = await tDataToBeAdded.save();
      // //console.log(savedTData);

      // //console.log(savedJobDetail);
    }

    res.status(200).send("Updated status and data of the candidate");
  } catch (err) {
    //console.log(err);
    res.status(200).send(err);
  }
});

// EDIT CA DETAILS RENDER PAGE
router.get("/ca/:ca_id", isCAAuth, async (req, res) => {
  try {
    const ca_id = req.params.ca_id;
    const caData = await caModel.findOne({ ca_id: ca_id });
    const isAuthCA = (req.session?.isAuthCA);
    res.status(200).render("caDetailsEdit", {isAuthCA, caData });
  } catch (err) {
    //console.log(err);
    res.status(500).send("Error");
  }
});

// EDIT CA DETAILS ROUTE
router.post("/ca/:ca_id", isCAAuth, async (req, res) => {
  try {
    const ca_id = req.params.ca_id;
    const caData = await caModel.findOneAndUpdate(
      { ca_id: ca_id },
      { $set: req.body },
      { new: true }
    );
    //console.log(caData);

    // res.redirect("..");
    res.redirect('/ca/profile');
  } catch (err) {
    //console.log(err);
    res.status(400).send("Error");
  }
});

// EDIT MENTOR DETAILS RENDER PAGE
router.get("/mentor/:men_id", isMentorAuth, async (req, res) => {
  try {
    const men_id = req.params.men_id;
    const men_data = await mentorModel.findOne({ men_id: men_id });
    const isAuthMentor = (req.session?.isAuthMentor);
    res.status(200).render("mentorDetailsEdit", {isAuthMentor, men_data });
  } catch (err) {
    //console.log(err);
    res.status(500).send("Error");
  }
});

// EDIT MENTOR DETAILS ROUTE
router.post("/mentor/:men_id", isMentorAuth, async (req, res) => {
  try {
    const men_id = req.params.men_id;
    const men_data = await mentorModel.findOneAndUpdate(
      { men_id: men_id },
      { $set: req.body },
      { new: true }
    );
    //console.log(men_data);

    res.redirect('/mentor/profile');
  } catch (err) {
    //console.log(err);
    res.status(400).send("Error");
  }
});

module.exports = router;
