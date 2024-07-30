// Import and setup modules
const express = require("express");
const router = express.Router();

const authorRouter = require("./author.js");
const readerRouter = require("./reader.js");
const profileRouter = require("./profile.js");

// Use router and set its browser URL endpoint prefix
router.use("/reader", readerRouter);
router.use("/author", authorRouter);
router.use("/profile", profileRouter);

// Export module containing the following so external files can access it
module.exports = router;

