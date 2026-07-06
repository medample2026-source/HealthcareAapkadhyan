const express = require("express");
const {
  getNearbyHealthcare,
} = require("../controllers/nearbyHealthcareController");

const router = express.Router();

router.get("/", getNearbyHealthcare);

module.exports = router;
