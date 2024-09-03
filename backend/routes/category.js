//  * category.js

//Import express framework 
const express = require("express");
//new router object
const router = express.Router();
//body parser middleware
const bodyParser = require("body-parser");
const { 
    //helper functions to render transaction types
    renderTransactionType,
    //import functions to get listings for category
    getListingsByCategory,
    //import function to get images for products
    getImagesForProducts 
    //import helper function from the queries,js 
} = require('./queries'); 

router.use(bodyParser.urlencoded({ extended: true }));

// Route to handle GET requests by category
router.get('/:category', async (req, res) => {
    //check if user is authenticated, if not, redirect it to login page
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    try {
        //get category from the requested parameters
        const category = req.params.category;
        //get listings for category from the database
        const listings = await getListingsByCategory(category);
        //get images for the fetched listings
        const listingsImages = await getImagesForProducts(listings);
        //render category page with listings, images, and transaction types
        res.render("category.ejs", {
            category: category,
            listings: listings,
            listingsImages: listingsImages,
            renderTransactionType: renderTransactionType
        });
    } catch (err) {
        //error handling
        res.status(500).send(err.message);
    }
});
//export the router to be used in other parts of the application
module.exports = router;
