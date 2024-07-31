// //  * profile.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));

// I will change this part to be for modular
// Route to handle GET requests to the profile page
router.get('/', (req, res) => {;
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    }

    // Retrieve the user's email from session
    const email = req.session.user.email;

    // Query to get user details from the database
    const userQuery = "SELECT * FROM users WHERE email = ?";
        
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            return res.status(500).send(err.message);
        } else {
             // Query to get all courses from the database
            const schoolsQuery = "SELECT * FROM courses";
            global.db.all(schoolsQuery, [], (err, schools) => {
                if (err) {
                    return res.status(500).send(err.message);
                } else {
                    // Query to get all listings created by the user
                    const listingsQuery = "SELECT * FROM product WHERE user_id = ?";
                    global.db.all(listingsQuery, [user.user_id], (err, listings) => {
                        if (err) {
                            return res.status(500).send(err.message);
                        } else {
                            // Query to get all reviews for the user
                            const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
                            global.db.all(reviewsQuery, [user.user_id], (err, reviews) => {
                                if (err) {
                                    return res.status(500).send(err.message);
                                } else {
                                    // Query to get all favourite products of the user
                                    const favouritesQuery = `
                                        SELECT product.id, product.product_name, product.price, product.transaction_type
                                        FROM favourites
                                        JOIN product ON favourites.product_id = product.id
                                        WHERE favourites.user_id = ?
                                    `;
                                    global.db.all(favouritesQuery, [user.user_id], (err, favourites) => {
                                        if (err) {
                                            return res.status(500).send(err.message);
                                        } else {
                                            res.render("profile.ejs", {
                                                user: user,
                                                schools: schools,
                                                listings: listings,
                                                reviews: reviews,
                                                favourites: favourites
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            
        }
    });
});

// Route to handle POST requests for updating the user's name
router.post('/update-name', (req, res) => {
    const email = req.session.user.email;
    const newName = req.body.name;

    // Query to update the user's name in the database
    const updateNameQuery = "UPDATE users SET name = ? WHERE email = ?";
    global.db.run(updateNameQuery, [newName, email], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect('/profile');
    });
});

// Route to handle POST requests for updating the user's course
router.post('/update-course', (req, res) => {
    const email = req.session.user.email;
    const newCourse = req.body.course;

     // Query to update the user's course in the database
    const updateDescriptionQuery = "UPDATE users SET course = ? WHERE email = ?";
    global.db.run(updateDescriptionQuery, [newCourse, email], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect('/profile');
    });
});

// Route to handle POST requests for updating the user's description
router.post('/update-description', (req, res) => {
    const email = req.session.user.email;
    const newDescription = req.body.description;

    // Query to update the user's description in the database
    const updateDescriptionQuery = "UPDATE users SET description = ? WHERE email = ?";
    global.db.run(updateDescriptionQuery, [newDescription, email], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.redirect('/profile');
    });
});

// Export the router object
module.exports = router;
