// Import and setup modules
const express = require("express");
const router = express.Router();

//Import route handlers from the other modules
const profileRouter = require("./profile.js");
const productRoute = require("./product_page.js");
const categoryRoute = require("./category.js");

// Use router and set its browser URL endpoint prefix
router.use("/profile", profileRouter);
router.use("/product", productRoute);
router.use("/category", categoryRoute);

// export router object so it can be used in other parts of the application
module.exports = router;
