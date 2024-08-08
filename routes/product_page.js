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
    const { name, description, price, category, transaction, condition } = req.body;

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
            global.db.run(productQuery, [user.user_id, name, description, 10, category, transaction, condition, new Date().toLocaleString()], function (err) {
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
    const query = "SELECT * FROM product WHERE id = ?";
    global.db.get(query, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        
       const imagesQuery = "SELECT * FROM product_images WHERE product_id = ?";
        global.db.all(imagesQuery, [req.params.id], (err, images) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            res.render("show_product.ejs", { 
                product: product,
                images: images 
            });
        });
    });
});

module.exports = router;
