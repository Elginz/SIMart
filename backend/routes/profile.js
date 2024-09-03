//  * profile.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const {
    getUserByEmail,
    getUserById,
    getAllSchools,
    getListings,
    getImagesForProducts,
    getReviews,
    getReviewersForReviews,
    getTransactions,
    getFavourites,
    updateUserAttribute,
    renderTransactionType
} = require('./queries');

router.use(bodyParser.urlencoded({ extended: true }));

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //set the directory for uploads
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        //to set the filename with current time and original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Route to handle GET requests to the profile page
router.get('/', async (req, res) => {
    //redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    try {
        const email = req.session.user.email;
        const sessionUserId = req.session.user.id;
        //get user details and associated data
        const user = await getUserByEmail(email);
        if (!user) {
            //error handling
            return res.status(404).send("User not found");
        }

        const schools = await getAllSchools();
        const listings = await getListings(user.id);
        const listingsImages = await getImagesForProducts(listings);
        const reviews = await getReviews(sessionUserId);
        const reviewers = await getReviewersForReviews(reviews);
        const transactions = await getTransactions(sessionUserId);
        const transactionsImages = await getImagesForProducts(transactions);
        const favourites = await getFavourites(user.id);
        const favouritesImages = await getImagesForProducts(favourites);

        //render profile page with the retrieved data
        res.render("profile.ejs", {
            user: user,
            sessionUserId: sessionUserId,
            schools: schools,
            listings: listings,
            listingsImages: listingsImages,
            reviews: reviews,
            reviewers: reviewers,
            transactions: transactions,
            transactionsImages: transactionsImages,
            favourites: favourites,
            favouritesImages: favouritesImages,
            renderTransactionType: renderTransactionType
        });

    } catch (err) {
        //error handling
        res.status(500).send(err.message);
    }
});

// Route to handle GET requests for a specific user profile
router.get('/:id', async (req, res) => {
    //redirect to login if the user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    try {
        //retrieve user details and asosciated data by user ID
        const sessionUserId = req.params.id;

        const user = await getUserById(sessionUserId);
        if (!user) {
            //error handling
            return res.status(404).send("User not found");
        }

        const schools = await getAllSchools();
        const listings = await getListings(user.id);
        const listingsImages = await getImagesForProducts(listings);
        const reviews = await getReviews(user.id);
        const reviewers = await getReviewersForReviews(reviews);
        const transactions = await getTransactions(user.id);
        const transactionsImages = await getImagesForProducts(transactions);
        const favourites = await getFavourites(user.id);
        const favouritesImages = await getImagesForProducts(favourites);

        //render profile page with the retrieved data
        res.render("profile.ejs", {
            user: user,
            sessionUserId: sessionUserId,
            schools: schools,
            listings: listings,
            listingsImages: listingsImages,
            reviews: reviews,
            reviewers: reviewers,
            transactions: transactions,
            transactionsImages: transactionsImages,
            favourites: favourites,
            favouritesImages: favouritesImages,
            renderTransactionType: renderTransactionType
        });

    } catch (err) {
        //error handling
        res.status(500).send(err.message);
    }
});

// Route to handle POST requests for updating the user's image
router.post('/update-image', upload.single('image'), async (req, res) => {
    //to redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    if (!req.file) {
        //error handling if no file added
        return res.status(400).send('No file uploaded.');
    }

    const sessionUserId = req.session.user.id;
    const image = fs.readFileSync(req.file.path);
    const imageType = req.file.mimetype;

    try {
        const user = await getUserById(sessionUserId);
        if (!user) {
            return res.status(404).send('User not found.');
        }
        //update the user's image 
        const updateUserImageQuery = "UPDATE users SET image = ?, image_type = ? WHERE id = ?";
        global.db.run(updateUserImageQuery, [image, imageType, sessionUserId], (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            //redire to profile page right after a new update
            res.redirect('/profile');
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Route to handle POST requests for updating the user's name
router.post('/update-name', (req, res) => {
    //redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    
    const sessionUserId = req.session.user.id;
    const newName = req.body.name;
    //update user's name
    updateUserAttribute('name', newName, sessionUserId, res);
});

// Route to handle POST requests for updating the user's course
router.post('/update-course', (req, res) => {
    //redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }
    //update the user's course
    const sessionUserId = req.session.user.id;
    const newCourse = req.body.course;
    updateUserAttribute('course', newCourse, sessionUserId, res);
});

// Route to handle POST requests for updating the user's description
router.post('/update-description', (req, res) => {
    //redirect to login page if user is not authenticated
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    const sessionUserId = req.session.user.id;
    const newDescription = req.body.description;
    updateUserAttribute('description', newDescription, sessionUserId, res);
});

// Export the router object
module.exports = router;
