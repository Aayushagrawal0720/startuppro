const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const router = express.Router();

const startUpScheme = require("../models/startupScheme");
const teamMemberModel = require("../models/teamMemberModel");
const jobDetailModel = require("../models/jobDetailModel");
const jobPostModel = require("../models/jobPostModel");
const appliedJobsModel = require("../models/appliedJobsModel");
const dynamicColSchemas = require("../models/dynamicCollectionSchema");
const timelineEventSchema = require("../models/timelineEventSchema");
const caModel = require("../models/CASchema");
const mentorModel = require("../models/mentorSchema");

// Middlewares
const {
  isAuth,
  isStartupLoggedIn,
  isUserAuth,
} = require("../middleware/authFuncs");

// Simple GET response
router.get("/", async (req, res) => {
  try {
    res.status(200).send("Here we get data");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET ALL STARTUPS
router.get("/startups", async (req, res) => {
  try {
    let founderArray = [];
    let startupFoundersArray = [];

    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find();
    // console.log(startups);

    // creating array which only has founder info
    if(startups != null && startups.length !=0){
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });
  }
    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      if(item!=null && item[0] != null && item[0]!=undefined){
      founderArray.push(
        new Promise((resolve, reject) => {
          teamMemberModel
            .findOne({ mid: item[0] })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
      }
    });

    founderArray = await Promise.all(founderArray);
    // console.log(founderArray);

    // FETCHING JOB DETAILS DATA OF ONLY SINGLE FOUNDER RIGHT NOW
    if(founderArray && founderArray[0] && founderArray[0].mid){
    var jobDetailData = await jobDetailModel.findOne({
      mid: founderArray[0].mid,
    });
  }
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

    var memberData = null;
    const isLogin = false;
    const logoutLink = "/";
    var isEmployed = false;

    if (req.session.isAuth) {
      return res.redirect("/startup/profile/posts");
    }

    if (req.session.isAuthUser) {
      return res.redirect("/member/profile");
    }

    if (req.session.isAuthCA) {
      return res.redirect("/ca/profile");
    }

    if (req.session.isAuthMentor) {
      return res.redirect("/mentor/profile");
    }

    return res.status(200).render("userLogin", {
      memberData,
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      logoutLink,
      isEmployed,
      filterArray,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// GET STARTUPS BY INDUSTRY TYPE
router.get("/startups/:industry", async (req, res) => {
  try {
    let industry = req.params.industry;

    if (req.params.industry == "Information") {
      industry = "Information Technology";
    }
    if (req.params.industry == "Marketing") {
      industry = "Marketing and Advertisement";
    }
    // console.log(industry);

    let founderArray = [];
    let startupFoundersArray = [];

    // GETTING STARTUP DATAs AND THEIR FOUNDER DATAs
    const startups = await startUpScheme.find({ Industry: industry });
    // console.log(startups);

    if (startups.length === 0) {
      var redirectMsg =
        "No startups found for this category. You're being redirected back to the Startups page";
      var redirectUrl = "/getdata/startups";

      return res.render("redirectPage", { redirectMsg, redirectUrl });
    }

    // creating array which only has founder info
    startups.forEach((item, index) => {
      startupFoundersArray.push(item.founders);
    });
    // console.log(startupFoundersArray);

    // creatng array of founder data
    startupFoundersArray.forEach((item) => {
      founderArray.push(
        new Promise((resolve, reject) => {
          teamMemberModel
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

    var memberData = null;
    var isLogin = false;
    var logoutLink = "/";
    var isEmployed = false;

    if(req.session.isAuth){
      isLogin = true;
      return res.status(200).render("startupLoginPosts", {
        startups,
        founderArray,
        jobDetailData,
        isLogin,
        filterArray,
      });
    }

    if (req.session.isAuthUser) {
      const mid = req.session.mid;
      memberData = await teamMemberModel.findOne({ mid: mid });
      isLogin = true;
      logoutLink = "/logout/member";
      const jobDetailDataUser = await jobDetailModel.findOne({ mid: mid });
      if (!jobDetailDataUser) isEmployed = false;
      else isEmployed = true;
      return res.status(200).render("userLogin", {
        memberData,
        startups,
        founderArray,
        jobDetailData,
        isLogin,
        logoutLink,
        isEmployed,
        filterArray,
      });
    }

    if (req.session.isAuthCA) {
      const ca_id = req.session.ca_id;
      const caData = await caModel.findOne({ ca_id: ca_id });
      isLogin = true;
      logoutLink = "/logout/ca";

      return res.status(200).render("caLogin", {
        caData,
        startups,
        founderArray,
        jobDetailData,
        isLogin,
        logoutLink,
        filterArray,
      });
    }

    if (req.session.isAuthMentor) {
      const men_id = req.session.men_id;
      const mentorData = await mentorModel.findOne({ men_id: men_id });
      isLogin = true;
      logoutLink = "/logout/mentor";

      return res.status(200).render("mentorLogin", {
        mentorData,
        startups,
        founderArray,
        jobDetailData,
        isLogin,
        logoutLink,
        filterArray,
      });
    }

    return res.status(200).render("userLogin", {
      memberData,
      startups,
      founderArray,
      jobDetailData,
      isLogin,
      logoutLink,
      isEmployed,
      filterArray,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// GET STARTUP DATA
router.get("/startup/:uid", async (req, res) => {
  const uid = req.params.uid;
  const startupData = await startUpScheme.findOne({ uid: uid });

  // GETTING TIMELINE DATA
  var name = startupData.startup_name;
  const timelineModel = new mongoose.model(
    `${uid}_timeline_collection`,
    timelineEventSchema
  );
  const foundData = await timelineModel.find().sort({ date: -1 }).limit(2);
  // console.log(foundData);

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

  const foundTypes = await dynamicTypeModel.find();
  // console.log(foundTypes);

  if (foundTypes.length != 0) {
    foundTypes.forEach((item, index) => {
      resArray.push(
        new Promise((resolve, reject) => {
          graphModel
            .find({ type_id: item.type_id })
            .sort({ date: 1 })
            .select({ date: 1, total: 1, type_title: 1, type_type: 1 })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });
    resArray = await Promise.all(resArray);
    // console.log(resArray);
  }

  // Checking resArray
  let emptyEls = 0;
  resArray.forEach((item) => {
    if (item.length == 0) emptyEls += 1;
  });
  if (emptyEls == resArray.length) resArray = [];

  const isLogin = false;

  // FETCHING FOUNDER DATA
  const mid = startupData.founders[0];
  const founderData = await teamMemberModel.findOne({ mid: mid });

  // FETCHING FOUNDER'S JOB DATA
  var jobDetailData = await jobDetailModel.findOne({ mid: mid });
  if (!jobDetailData) {
    jobDetailData = { job_title: "Founder" };
  }

  // FETCHING JOB ALERTS
  const jobAlerts = await jobPostModel
    .find({ uid: uid, status: { $in: ["Active", "active", "ACTIVE"] } })
    .select({ title: 1, jid: 1, employment_type: 1 })
    .limit(2);

  // FETCHING TEAM MEMBERS AND THEIR JOBS
  let finalTeamArray = [];

  const team = await teamMemberModel
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

  res.render("startupLogin", {
    foundData,
    startupData,
    resArray,
    isLogin,
    founderData,
    jobDetailData,
    jobAlerts,
    finalTeamArray,
  });
});

// GET TIMELINE DATA
router.get("/timeline/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    var startupData = await startUpScheme
      .findOne({ uid: uid })
      .select({ startup_name: 1 });

    const timelineModel = new mongoose.model(
      `${uid}_timeline_collection`,
      timelineEventSchema
    );
    const foundData = await timelineModel.find().sort({ date: -1 });
    // console.log(foundData);
    // res.status(200).json(foundData);
    res.status(200).render("timeline", { foundData, startupData });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET GRAPH DATA
router.get("/graph/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    let resArray = [];
    const dynamicTypeModel = new mongoose.model(
      `${uid}_typecollections`,
      dynamicColSchemas.typeSchema
    );
    const graphModel = new mongoose.model(
      `${uid}_graph_eventcollections`,
      dynamicColSchemas.typeEventSchema
    );

    const foundTypes = await dynamicTypeModel.find();
    console.log(foundTypes);

    foundTypes.forEach((item, index) => {
      resArray.push(
        new Promise((resolve, reject) => {
          graphModel
            .find({ type_id: item.type_id })
            .sort({ date: 1 })
            .select({ date: 1, total: 1, type_title: 1, type_type: 1 })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
      );
    });
    resArray = await Promise.all(resArray);
    // let finalArray = [];
    // resArray.forEach((item) => {
    //   if (item.length != 0) {
    //     item.forEach((subItem) => (subItem = subItem.total));
    //     finalArray.push(item);
    //   }
    // });

    // res.send(resArray);

    // res.send(finalArray);
    // res.send(foundTypes);
    res.status(200).render("graphs", { resArray });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET JOB DETAILS SET BY USERS OF A STARTUP DATA
router.get("/startup/jobdetails/:uid", isAuth, async (req, res) => {
  const uid = req.params.uid;
  const startupData = await startUpScheme
    .findOne({ uid: uid })
    .select({ startup_name: 1 });
  const jobDetails = await jobDetailModel.find({ uid: uid });

  let finalArray = [];

  jobDetails.forEach((item, index) => {
    finalArray.push(
      new Promise((resolve, reject) => {
        var mid = item.mid;
        teamMemberModel
          .findOne({ mid: mid })
          .select({ member_name: 1, member_Email: 1, pic_url: 1 })
          .then((data) => {
            var newObject = {};
            // newObject["member_name"] = data.member_name ;
            newObject.jobData = item;
            newObject.userData = data;
            newObject.startupData = startupData;
            resolve(newObject);
          })
          .catch((err) => {
            var newObject = item;
            newObject["member_name"] = "no member";
            reject(newObject);
          });
      })
    );
  });

  finalArray = await Promise.all(finalArray);

  // res.send(finalArray);
  res.status(200).render("jobDetailsPage", { finalArray });
});

// SEE JOB ALTERTS SET BY COMPANY FOR EVERYONE
const checkUserForJobs = (req, res, next) => {
  if (req.session.isAuthUser)
    return res.redirect(`/getdata/jobalerts/${req.session.mid}`);

  return next();
};
const checkUserForJobDetail = (req, res, next) => {
  if (req.session.isAuthUser)
    return res.redirect(
      `/getdata/jobalert/${req.params.jid}/${req.session.mid}`
    );

  return next();
};

router.get("/jobalerts", checkUserForJobs, async (req, res) => {
  try {
    const jobAlerts = await jobPostModel.find();

    var noAlerts = false;

    if (jobAlerts.length === 0) {
      noAlerts = true;
      return res.render("jobAlertsPage", { noAlerts });
    }

    let resArray = [];

    jobAlerts.forEach((item) => {
      resArray.push(
        new Promise((resolve, reject) => {
          startUpScheme
            .findOne({ uid: item.uid })
            .select({
              startup_name: 1,
              mobile_no: 1,
              email_official: 1,
              pic_url: 1,
              city: 1,
              state: 1,
              Industry: 1,
            })
            .then((data) => {
              var newObject = {};
              newObject.jobAlert = item;
              newObject.startupData = data;
              resolve(newObject);
            });
        })
      );
    });

    resArray = await Promise.all(resArray);
    res.status(200).render("jobAlertsPagePublic", { resArray, noAlerts });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

router.get("/jobalert/:jid", checkUserForJobDetail, async (req, res) => {
  try {
    const jid = req.params.jid;
    const jobAlert = await jobPostModel.findOne({ jid: jid });
    const startupData = await startUpScheme.findOne({ uid: jobAlert.uid });

    res.status(200).render("jobAlertDetailPublic", { jobAlert, startupData });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// SEE JOB ALERTS SET BY COMPANY (FOR USERS)
router.get("/jobalerts/:mid", isUserAuth, async (req, res) => {
  try {
    const mid = req.params.mid;
    const jobAlerts = await jobPostModel.find();

    var noAlerts = false;

    if (jobAlerts.length === 0) {
      noAlerts = true;
      return res.render("jobAlertsPage", { noAlerts });
    }

    let resArray = [];

    jobAlerts.forEach((item, index) => {
      resArray.push(
        new Promise((resolve, reject) => {
          startUpScheme
            .findOne({ uid: item.uid })
            .select({
              startup_name: 1,
              mobile_no: 1,
              email_official: 1,
              pic_url: 1,
              city: 1,
              state: 1,
              Industry: 1,
            })
            .then((data) => {
              var newObject = {};
              newObject.jobAlert = item;
              newObject.startupData = data;
              resolve(newObject);
            });
        })
      );
    });

    resArray = await Promise.all(resArray);
    res.status(200).render("jobAlertsPage", { mid, resArray, noAlerts });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// SEE A PARTICULAR JOB ALERT DETAIL SET BY COMPANY (FOR USERS)
router.get("/jobalert/:jid/:mid", isUserAuth, async (req, res) => {
  try {
    const jid = req.params.jid;
    const mid = req.params.mid;

    const jobAlert = await jobPostModel.findOne({ jid: jid });
    const userData = await teamMemberModel
      .findOne({ mid: mid })
      .select({ mid: 1, member_name: 1 });
    const startupData = await startUpScheme.findOne({ uid: jobAlert.uid });

    res
      .status(200)
      .render("jobAlertDetail", { jobAlert, userData, startupData });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Error");
  }
});

// SEE JOB ALERTS SET BY COMPANY (FOR STARTUPS)
router.get("/startup/jobalerts/:uid", isAuth, async (req, res) => {
  try {
    const uid = req.params.uid;
    const jobAlerts = await jobPostModel.find({ uid: uid });

    var noAlerts = false;

    if (jobAlerts.length === 0) {
      noAlerts = true;
      return res.render("jobAlertsPage", { noAlerts });
    }

    let resArray = [];

    jobAlerts.forEach((item) => {
      resArray.push(
        new Promise((resolve, reject) => {
          startUpScheme
            .findOne({ uid: item.uid })
            .select({
              startup_name: 1,
              mobile_no: 1,
              email_official: 1,
              pic_url: 1,
              city: 1,
              state: 1,
              Industry: 1,
            })
            .then((data) => {
              var newObject = {};
              newObject.jobAlert = item;
              newObject.startupData = data;
              resolve(newObject);
            });
        })
      );
    });

    resArray = await Promise.all(resArray);
    res.status(200).render("jobAlertsPageStartup", { resArray, noAlerts });
  } catch (e) {}
});

// SEE JOB ALERTS SET BY COMPANY (FOR USERS)
router.get("/startup/jobalerts/public/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const jobAlerts = await jobPostModel.find({ uid: uid });

    var noAlerts = false;

    if (jobAlerts.length === 0) {
      noAlerts = true;
      return res.render("jobAlertsPageStartupPublic", { noAlerts });
    }

    let resArray = [];

    jobAlerts.forEach((item) => {
      resArray.push(
        new Promise((resolve, reject) => {
          startUpScheme
            .findOne({ uid: item.uid })
            .select({
              startup_name: 1,
              mobile_no: 1,
              email_official: 1,
              pic_url: 1,
              city: 1,
              state: 1,
              Industry: 1,
            })
            .then((data) => {
              var newObject = {};
              newObject.jobAlert = item;
              newObject.startupData = data;
              resolve(newObject);
            });
        })
      );
    });

    resArray = await Promise.all(resArray);
    res
      .status(200)
      .render("jobAlertsPageStartupPublic", { resArray, noAlerts });
  } catch (e) {}
});

// SEE JOB ALERTS APPLIED CANDIDATES (FOR STARTUPS)
router.get(
  "/startup/jobalert/appliedcandidates/:jid",
  isAuth,
  async (req, res) => {
    try {
      const jid = req.params.jid;

      const jobData = await jobPostModel.findOne({ jid: jid });

      const appliedCandidates = await appliedJobsModel.find({ jid: jid });

      if (appliedCandidates.length === 0) {
        var redirectMsg =
          "No Applied Candidates. You will be redirected back to Job Alerts Page";
        var redirectUrl = `/getdata/startup/jobalerts/${req.session.uid}`;

        return res
          .status(404)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      let finalArray = [];

      appliedCandidates.forEach((item) => {
        finalArray.push(
          new Promise((resolve, reject) => {
            var mid = item.mid;
            teamMemberModel
              .findOne({ mid: mid })
              .select({
                member_name: 1,
                member_Email: 1,
                pic_url: 1,
                skills: 1,
                resume_url: 1,
                mid: 1,
              })
              .then((data) => {
                var newObject = {};
                newObject.userData = data;
                newObject.appliedData = item;

                resolve(newObject);
              })
              .catch((err) => {
                var newObject = item;
                newObject["member_name"] = "no member";
                reject(newObject);
              });
          })
        );
      });

      finalArray = await Promise.all(finalArray);

      // res.send(finalArray);
      res.status(200).render("appliedCandidatesPage", { finalArray, jobData });
    } catch (e) {
      console.log(e);
      res.status(500).send("Server Error");
    }
  }
);

// SEE JOB ALERTS APPLIED CANDIDATES FILTER BY STATUS (FOR STARTUPS)
router.get(
  "/startup/jobalert/appliedcandidates/:jid/:status",
  isAuth,
  async (req, res) => {
    try {
      const jid = req.params.jid;
      const status = req.params.status;

      const jobData = await jobPostModel.findOne({ jid: jid });

      const appliedCandidates = await appliedJobsModel.find({
        jid: jid,
        status: status,
      });

      if (appliedCandidates.length === 0) {
        var redirectMsg =
          "No Applied Candidates. You will be redirected back to Applications Received Page";
        var redirectUrl = `/getdata/startup/jobalert/appliedcandidates/${jobData.jid}`;

        return res
          .status(404)
          .render("redirectPage", { redirectMsg, redirectUrl });
      }

      let finalArray = [];

      appliedCandidates.forEach((item) => {
        finalArray.push(
          new Promise((resolve, reject) => {
            var mid = item.mid;
            teamMemberModel
              .findOne({ mid: mid })
              .select({
                member_name: 1,
                member_Email: 1,
                pic_url: 1,
                skills: 1,
                resume_url: 1,
                mid: 1,
              })
              .then((data) => {
                var newObject = {};
                newObject.userData = data;
                newObject.appliedData = item;

                resolve(newObject);
              })
              .catch((err) => {
                var newObject = item;
                newObject["member_name"] = "no member";
                reject(newObject);
              });
          })
        );
      });

      finalArray = await Promise.all(finalArray);

      // res.send(finalArray);
      res.status(200).render("appliedCandidatesPage", { finalArray, jobData });
    } catch (e) {
      console.log(e);
      res.status(500).send("Server Error");
    }
  }
);

// SEE TEAM MEMBERS OF A COMPANY
router.get("/startup/teammembers/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    let finalArray = [];

    const startupData = await startUpScheme
      .findOne({ uid: uid })
      .select({ startup_name: 1 });

    const team = await teamMemberModel.find({ startupMember: uid }).select({
      startupAdmin: 0,
      startupMember: 0,
      skills: 0,
      password: 0,
      mobile_no: 0,
    });

    if (team.length === 0) {
      return res
        .status(200)
        .render("startupTeamPage", { startupData, finalArray });
    }

    team.forEach((item) => {
      finalArray.push(
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

    finalArray = await Promise.all(finalArray);

    // res.status(200).send(finalArray);
    res.status(200).render("startupTeamPage", { startupData, finalArray });
  } catch (e) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
