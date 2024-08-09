// //  * category.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/:category', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    // Retrieve the category from the URL
    const category = req.params.category;

    // Query to get all listings with the specified category
    const listingsQuery = "SELECT * FROM product WHERE LOWER(category) = ?";
    global.db.all(listingsQuery, [category], (err, listings) => {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            res.render("category.ejs", {
                category: category,
                listings: listings
            });
        }
    });
});

module.exports = router;