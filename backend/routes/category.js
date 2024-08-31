//  * category.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { 
    renderTransactionType,
    getListingsByCategory,
    getImagesForProducts 
} = require('./queries'); // Import the helper function

router.use(bodyParser.urlencoded({ extended: true }));

// Route to handle GET requests by category
router.get('/:category', async (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    try {
        const category = req.params.category;

        const listings = await getListingsByCategory(category);
        const listingsImages = await getImagesForProducts(listings);

        res.render("category.ejs", {
            category: category,
            listings: listings,
            listingsImages: listingsImages,
            renderTransactionType: renderTransactionType
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
