const express = require("express");
const session = require("express-session");
const router = express.Router();

//Importing scheme data
const startUpScheme = require("../models/startupScheme");
const membersModel = require("../models/teamMemberModel");

// Simple GET response
router.get("/", (req, res) => {
  res.send("Here we delete data");
});

// Delete a Startup Team Member
router.delete("/startup/teammember", async (req, res) => {
  try {
    const mid = req.headers.mid;

    // DELETING THE DATA FROM THE COLLECTION
    const deletedData = await membersModel.findOneAndDelete({ mid: mid });
    // Here, deletedData gives the data that is deleted

    //console.log(deletedData);

    res.status(200).send("Deleted");
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
