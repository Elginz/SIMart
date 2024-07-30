// //  * author.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check if the user is authorised
function checkAuthorised(req, res) {
    if (req.session.isAuthenticated && req.session.user.authorised) {
        return true; // User is authenticated and authorised
    } else if (!req.session.isAuthenticated) {
        res.redirect("/login"); // Redirect to login if not authenticated
        return false; // Return false since user is not authenticated
    } else {
        return false; // Return false if user is authenticated but not authorised
    }
}

router.get('/', checkAuthorised, (req, res) => {;
    const email = req.session.user.email;

    const userQuery = "SELECT * FROM users WHERE email = ?";
        
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            const listingsQuery = "SELECT * FROM product WHERE user_id = ?";
            global.db.all(listingsQuery, [user.user_id], (err, listings) => {
                if (err) {
                    return res.status(500).send(err.message);
                } else {
                    const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
                    global.db.all(reviewsQuery, [user.user_id], (err, reviews) => {
                        if (err) {
                            return res.status(500).send(err.message);
                        } else {
                            res.render("authors/profile.ejs", {
                                user: user,
                                listings: listings,
                                reviews: reviews
                            });
                        }
                    });
                }
            });
        }
    });
});

// Export the router object
module.exports = router;


