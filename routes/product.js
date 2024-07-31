// product.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));

// Display product page
router.get("/", (req, res) => {
    //Check if user is authorised to access page
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    res.render("product.ejs", {
        user: req.session.user
    });
});

// Export the router object
module.exports = router;
