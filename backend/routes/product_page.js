//product.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Display form to create a new product
router.get("/new", (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    } else {
        res.render("create_listing.ejs");
    }
});

// Handle the creation of a new product with image upload
router.post("/new", upload.array("images", 4), (req, res) => {
    let { name, description, price, category, transaction, condition } = req.body;

    // Ensure price is 0 if it is undefined (i.e., when the input was disabled)
    if (typeof price === 'undefined' || price === '') {
        price = 0;
    }

    // const imageData = fs.readFileSync(file.path).toString('base64');
    // const imageType = file.mimetype;
    // return `data:${imageType};base64,${imageData}`;

    // Read and concatenate images as a comma-separated string
    // const images = req.files ? req.files.map(file => fs.readFileSync(file.path).toString('base64')).join(',') : null;
    // Extract and concatenate image types
    // const imageTypes = req.files ? req.files.map(file => file.mimetype).join(',') : null;

    // Retrieve the user's email from session
    const email = req.session.user.email;

    const userQuery = "SELECT * FROM users WHERE email = ?";
        
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            return res.status(500).send(err.message);
        } else {
            const productQuery = "INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            global.db.run(productQuery, [user.user_id, name, description, price, category, transaction, condition, new Date().toLocaleString()], function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                }
                const productId = this.lastID; // Get the ID of the newly inserted product
                console.log(req.files);
                
                // Insert each image into the product_images table
                req.files.forEach(file => {
                    const imageData = fs.readFileSync(file.path);
                    const imageType = file.mimetype;

                    const imageQuery = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
                    global.db.run(imageQuery, [productId, imageData, imageType], function (err) {
                        if (err) {
                            console.error("Error inserting image:", err);
                        } else {
                            console.log("Inserted image for product ID:", productId);
                        }
                    });
                });

                res.redirect(`/product/${productId}`);
            });
        }
    });
});

// Display a single product
router.get("/:id", (req, res) => {

    // Takes the product info from the database
    const query = "SELECT * FROM product WHERE id = ?";
    global.db.get(query, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        
        // Takes the product images from the database
        const imagesQuery = "SELECT * FROM product_images WHERE product_id = ?";
        global.db.all(imagesQuery, [req.params.id], (err, images) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            // Takes the user info who listed the product from the database for the email address
            const userQuery = "SELECT * FROM users WHERE user_id = ?";
            global.db.get(userQuery, [product.user_id], (err, user) => {
                if (err) {
                    return res.status(500).send(err.message);
                }

                // Checks whether the product has been favourited by this user
                const favQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
                global.db.get(favQuery, [req.session.user.user_id, product.id], (err, fav) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    console.log("Favourite query result:", fav);

                    res.render("show_product.ejs", { 
                        product: product,
                        images: images,
                        user: user,
                        userId: req.session.user.user_id,
                        isFavourite: !!fav
                    });
                });
            });
        });
    });
});

// Handle adding a product to favourites
router.post("/:id", (req, res) => {
    const { review, rating } = req.body;
    const productId = req.params.id;

    console.log(review);
    console.log(rating);

    // Takes the product info from the database
    const query = "SELECT * FROM product WHERE id = ?";
    global.db.get(query, [productId], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Insert the review into the reviews table
        const reviewQuery = "INSERT INTO reviews (user_id, commenterName, commentContent, created_at, stars_given) VALUES (?, ?, ?, ?, ?)";
        global.db.run(reviewQuery, [product.user_id, req.session.user.name, review, new Date().toLocaleString(), rating], (err, fav) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            res.redirect("/");
        });
    });
});

// Handle adding a product to favourites
router.post("/favourites/add", (req, res) => {
    const { productId, userId } = req.body;

    console.log('productId:', productId, 'userId:', userId);

    if (!productId || !userId) {
        // console.error('Missing productId or userId');
        return res.status(400).json({ success: false, message: 'Product ID and User ID are required.' });
    }

    // Check if the Favourite entry already exists
    const checkFavQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
    global.db.get(checkFavQuery, [userId, productId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: err.message });
        }

        if (row) {
            // Entry already exists
            return res.status(400).json({ success: false, message: 'Product is already in favourites.' });
        }

        // Insert into favourites table
        const favQuery = "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)";
        global.db.run(favQuery, [userId, productId], function(err) {
            if (err) {
                // console.error('Database error:', err.message);
                return res.status(500).json({ success: false, message: err.message });
            }
            console.log('Product added to favourites:', { userId, productId });
            res.json({ success: true });
        });
    });
});

// Handle adding a product to favourites
router.post("/favourites/remove", (req, res) => {
    const { productId, userId } = req.body;

    const favQuery = "DELETE FROM favourites WHERE user_id = ? AND product_id = ?";
    global.db.run(favQuery, [userId, productId], (err, fav) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        console.log('Product removed from favourites:', { userId, productId });
        res.json({ success: true });
    });
});

module.exports = router;
