// Import and setup modules
const express = require("express");
const router = express.Router();

const productRoute = require("./product.js");

// Use router and set its browser URL endpoint prefix
router.use("/product", productRoute);

// Export module containing the following so external files can access it
module.exports = router;
