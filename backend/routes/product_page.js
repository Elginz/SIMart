const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Saving file to uploads/ directory`); // Logging the destination
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = uniqueSuffix + path.extname(file.originalname);
        console.log(`Generated filename: ${fileName}`); // Log the generated filename
        cb(null, fileName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 10 MB limit
});

// Display form to create a new product
router.get("/new", (req, res) => {
    let product = null;

    if (!req.session.isAuthenticated) {
        return res.redirect('/login');
    } else {
        res.render("create_listing.ejs", { product });
    }
});

// Insert each image into the product_images table
router.post("/new", upload.array("images", 4), (req, res) => {
    let { name, description, price, category, transaction, condition } = req.body;

    if (typeof price === 'undefined' || price === '') {
        price = 0;
    }

    if (Array.isArray(transaction)) {
        transaction = transaction.join(', ');
    }

    const email = req.session.user.email;

    const userQuery = "SELECT * FROM users WHERE email = ?";
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            console.error("Error retrieving user:", err.message);
            return res.status(500).send(err.message);
        }

        const productQuery = "INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        global.db.run(productQuery, [user.user_id, name, description, price, category, transaction, condition, new Date().toLocaleString()], function (err) {
            if (err) {
                console.error("Error inserting product:", err.message);
                return res.status(500).send(err.message);
            }

            const productId = this.lastID;

            // Insert each image into the product_images table
            req.files.forEach(file => {
                // Read the file as a binary buffer
                const imageData = fs.readFileSync(file.path);
                const imageType = file.mimetype;

                const imageQuery = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
                global.db.run(imageQuery, [productId, imageData, imageType], function (err) {
                    if (err) {
                        console.error("Error inserting image:", err.message);
                    } else {
                        console.log(`Inserted image for product ID: ${productId}`);
                    }
                });
            });

            res.redirect(`/product/${productId}`);
        });
    });
});

// these 3 parts must be above get.id

// Handle making an offer
router.post("/make-offer", (req, res) => {
    const { productId } = req.body;

    // Update offer status to 'made'
    const updateOfferStatusQuery = "UPDATE product SET offer_status= ? WHERE id = ?";
    global.db.run(updateOfferStatusQuery, ['made', productId], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        console.log('Offer status updated successfully for product ID:', productId);
        res.json({ success: true });
    });
});

// Handle an offer in progress
router.post("/offer-in-progress", (req, res) => {
    const { productId } = req.body;

    // Update offer status to 'in progress'
    const updateOfferStatusQuery = "UPDATE product SET offer_status = ? WHERE id = ?";
    global.db.run(updateOfferStatusQuery, ['in progress', productId], (err) => {
        if (err) {
            console.error('Error updating offer status:', err.message);
            return res.status(500).send(err.message);
        }
        console.log('offer status updated successfully for product ID:', productId);
        res.json({ success: true });
    });
});

// Handle completing an offer
router.post("/complete-offer", (req, res) => {
    const { productId } = req.body;

    // Update offer status to 'completed'
    const updateOfferStatusQuery = "UPDATE product SET availability = ?, offer_status = ? WHERE id = ?";
    global.db.run(updateOfferStatusQuery, [false, 'completed', productId], (err) => {
        if (err) {
            console.error('Error updating product availability:', err.message);
            return res.status(500).send(err.message);
        }
        console.log('offer status updated successfully for product ID:', productId);
        res.json({ success: true });
    });
});

// Display a single product
router.get("/:id", (req, res) => {

    // Retrieve the user's id from session
    const sessionUserId = req.session.user.user_id;

    const query = "SELECT * FROM product WHERE id = ?";
    global.db.get(query, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send("Error retrieving product: " + err.message);
        }

        if (!product) {
            return res.status(404).send("Product not found");
        }

        const imagesQuery = "SELECT * FROM product_images WHERE product_id = ?";
        global.db.all(imagesQuery, [req.params.id], (err, images) => {
            if (err) {
                return res.status(500).send("Error retrieving images: " + err.message);
            }

            // Convert image buffer to base64 for display
            images.forEach(image => {
                image.image = image.image.toString('base64');
            });

            const userQuery = "SELECT * FROM users WHERE user_id = ?";
            global.db.get(userQuery, [product.user_id], (err, user) => {
                if (err) {
                    return res.status(500).send("Error retrieving user: " + err.message);
                }

                const favQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
                global.db.get(favQuery, [req.session.user.user_id, product.id], (err, fav) => {
                    if (err) {
                        return res.status(500).send("Error retrieving favourite status: " + err.message);
                    }

                    res.render("show_product.ejs", { 
                        product: product,
                        images: images,
                        user: user,
                        sessionUserId: sessionUserId,
                        isFavourite: !!fav
                    });
                });
            });
        });
    });
});

// Handle adding a review
router.post("/:id", (req, res) => {
    const { review, rating } = req.body;
    const productId = req.params.id;

    // Takes the product info from the database
    const query = "SELECT * FROM product WHERE id = ?";
    global.db.get(query, [productId], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Insert the review into the reviews table
        const reviewQuery = "INSERT INTO reviews (user_id, commenterName, commentContent, created_at, stars_given) VALUES (?, ?, ?, ?, ?)";
        global.db.run(reviewQuery, [product.user_id, req.session.user.name, review, new Date().toLocaleString(), rating], (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            // Query to get all reviews for the user
            const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
            global.db.all(reviewsQuery, [product.user_id], (err, reviews) => {
                if (err) {
                    return res.status(500).send(err.message);
                }
                // Calculate the average rating
                const averageRating = reviews.length > 0
                    ? Math.floor(reviews.reduce((acc, review) => acc + review.stars_given, 0) / reviews.length)
                    : 0;

                // Update the user's rating in the database
                const updateRatingQuery = "UPDATE users SET rating = ? WHERE user_id = ?";
                global.db.run(updateRatingQuery, [averageRating, product.user_id], (err) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    } else {
                        res.redirect("/");
                    }
                });
            });
        });
    });
});

// Handle editing a listing
router.get("/edit/:id", (req, res) => {
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

            // Convert each image to base64
            const imageData = images.map(img => ({
                id: img.id,
                src: `data:${img.image_type};base64,${img.image.toString('base64')}`
            }));

            res.render("create_listing.ejs", { 
                product: product,
                imageData: imageData
            });
        });
    });
});

// idk how to fix this help T-T
router.post("/edit/:id", upload.array("images", 4), (req, res) => {
    let { name, description, price, category, transaction, condition, removeImages } = req.body;
    const files = req.files;

    if (typeof price === 'undefined' || price === '') {
        price = 0;
    }

    // Check if transaction is an array and join it
    if (Array.isArray(transaction)) {
        transaction = transaction.join(', ');
    }

    // Takes the product info from the database
    const updateProductQuery = "UPDATE product SET product_name = ?, content_description = ?, price = ?, category = ?, transaction_type = ?, condition = ? WHERE id = ?";
    global.db.run(updateProductQuery, [name, description, price, category, transaction, condition, req.params.id], (err, product) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Remove images from the database
        if (removeImages) {
            removeImages.forEach(imageId => {
                const deleteImageQuery = "DELETE FROM product_images WHERE id = ?";
                global.db.run(deleteImageQuery, [imageId], (err) => {
                    if (err) {
                        console.error("Error deleting image:", err);
                    } else {
                        console.log("Removed image with ID:", imageId);
                    }
                });
            });
        }

        if (files && files.length > 0) {
            files.forEach(file => {
                const imageData = fs.readFileSync(file.path);
                const imageType = file.mimetype;

                const insertImageQuery = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
                global.db.run(insertImageQuery, [req.params.id, imageData, imageType], (err) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    } else {
                        console.log("Inserted image for product ID:", req.params.id);
                        // Re-render the form with the updated product data
                        // res.render("show_product.ejs", { 
                        //     product: product 
                        // });
                    }
                });
            });
        }
        res.redirect(`/product/${req.params.id}`);
    });
});


// what's this for?
router.post("/create", (req, res) => {
    const { name, description, price, category, transaction, condition } = req.body;

    const email = req.session.user.email;

    const userQuery = "SELECT * FROM users WHERE email = ?";
    global.db.get(userQuery, [email], (err, user) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        const productQuery = "INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        global.db.run(productQuery, [user.user_id, name, description, price, category, transaction.join(', '), condition, new Date().toLocaleString()], function (err) {
            if (err) {
                return res.status(500).send(err.message);
            }

            const productId = this.lastID;
            res.redirect(`/product/${productId}/upload-images`); // Redirect to the image upload page
        });
    });
});

// why is there 2 of this
// Handle the creation of a new product with image upload
// router.post("/new", upload.array("images", 4), (req, res) => {
//     let { name, description, price, category, transaction, condition } = req.body;

//     // Ensure price is 0 if it is undefined
//     if (typeof price === 'undefined' || price === '') {
//         price = 0;
//     }

//     const email = req.session.user.email;

//     const userQuery = "SELECT * FROM users WHERE email = ?";
//     global.db.get(userQuery, [email], (err, user) => {
//         if (err) {
//             return res.status(500).send(err.message);
//         }

//         const productQuery = "INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
//         global.db.run(productQuery, [user.user_id, name, description, price, category, transaction, condition, new Date().toLocaleString()], function (err) {
//             if (err) {
//                 return res.status(500).send(err.message);
//             }

//             const productId = this.lastID;

//             // Insert each image into the product_images table
//             let imageInsertions = req.files.map(file => {
//                 return new Promise((resolve, reject) => {
//                     const imageData = fs.readFileSync(file.path);
//                     const imageType = file.mimetype;

//                     const imageQuery = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
//                     global.db.run(imageQuery, [productId, imageData, imageType], function (err) {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             console.log(`Inserted image for product ID: ${productId}`);
//                             resolve();
//                         }
//                     });
//                 });
//             });

//             // Wait for all image insertions to complete
//             Promise.all(imageInsertions)
//                 .then(() => {
//                     res.redirect(`/product/${productId}`);
//                 })
//                 .catch(err => {
//                     console.error("Error inserting images:", err);
//                     res.status(500).send("Error inserting images.");
//                 });
//         });
//     });
// });

// Handle adding a product to favourites
router.post("/favourites/add", (req, res) => {
    const { productId, userId } = req.body;

    if (!productId || !userId) {
        return res.status(400).json({ success: false, message: 'Product ID and User ID are required.' });
    }

    const checkFavQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
    global.db.get(checkFavQuery, [userId, productId], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        if (row) {
            return res.status(400).json({ success: false, message: 'Product is already in favourites.' });
        }

        const favQuery = "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)";
        global.db.run(favQuery, [userId, productId], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            res.json({ success: true });
        });
    });
});

// Handle removing a product from favourites
router.post("/favourites/remove", (req, res) => {
    const { productId, userId } = req.body;

    const favQuery = "DELETE FROM favourites WHERE user_id = ? AND product_id = ?";
    global.db.run(favQuery, [userId, productId], (err) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json({ success: true });
    });
});

module.exports = router;


// //product.js
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require('fs');

// // Configure multer storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
// });

// // Display form to create a new product
// router.get("/new", (req, res) => {
//     if (!req.session.isAuthenticated) {
//         return res.redirect('/login');
//     } else {
//         res.render("create_listing.ejs");
//     }
// });

// // Handle the creation of a new product with image upload
// router.post("/new", upload.array("images", 4), (req, res) => {
//     let { name, description, price, category, transaction, condition } = req.body;

//     // Ensure price is 0 if it is undefined (i.e., when the input was disabled)
//     if (typeof price === 'undefined' || price === '') {
//         price = 0;
//     }

//     // const imageData = fs.readFileSync(file.path).toString('base64');
//     // const imageType = file.mimetype;
//     // return `data:${imageType};base64,${imageData}`;

//     // Read and concatenate images as a comma-separated string
//     // const images = req.files ? req.files.map(file => fs.readFileSync(file.path).toString('base64')).join(',') : null;
//     // Extract and concatenate image types
//     // const imageTypes = req.files ? req.files.map(file => file.mimetype).join(',') : null;

//     // Retrieve the user's email from session
//     const email = req.session.user.email;

//     const userQuery = "SELECT * FROM users WHERE email = ?";
        
//     global.db.get(userQuery, [email], (err, user) => {
//         if (err) {
//             return res.status(500).send(err.message);
//         } else {
//             const productQuery = "INSERT INTO product (user_id, product_name, content_description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
//             global.db.run(productQuery, [user.user_id, name, description, price, category, transaction, condition, new Date().toLocaleString()], function (err) {
//                 if (err) {
//                     return res.status(500).send(err.message);
//                 }
//                 const productId = this.lastID; // Get the ID of the newly inserted product
//                 console.log(req.files);
                
//                 // Insert each image into the product_images table
//                 req.files.forEach(file => {
//                     const imageData = fs.readFileSync(file.path);
//                     const imageType = file.mimetype;

//                     const imageQuery = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
//                     global.db.run(imageQuery, [productId, imageData, imageType], function (err) {
//                         if (err) {
//                             console.error("Error inserting image:", err);
//                         } else {
//                             console.log("Inserted image for product ID:", productId);
//                         }
//                     });
//                 });

//                 res.redirect(`/product/${productId}`);
//             });
//         }
//     });
// });

// // Display a single product
// router.get("/:id", (req, res) => {

//     // Takes the product info from the database
//     const query = "SELECT * FROM product WHERE id = ?";
//     global.db.get(query, [req.params.id], (err, product) => {
//         if (err) {
//             return res.status(500).send(err.message);
//         }
        
//         // Takes the product images from the database
//         const imagesQuery = "SELECT * FROM product_images WHERE product_id = ?";
//         global.db.all(imagesQuery, [req.params.id], (err, images) => {
//             if (err) {
//                 return res.status(500).send(err.message);
//             }

//             // Takes the user info who listed the product from the database for the email address
//             const userQuery = "SELECT * FROM users WHERE user_id = ?";
//             global.db.get(userQuery, [product.user_id], (err, user) => {
//                 if (err) {
//                     return res.status(500).send(err.message);
//                 }

//                 // Checks whether the product has been favourited by this user
//                 const favQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
//                 global.db.get(favQuery, [req.session.user.user_id, product.id], (err, fav) => {
//                     if (err) {
//                         return res.status(500).send(err.message);
//                     }

//                     console.log("Favourite query result:", fav);

//                     res.render("show_product.ejs", { 
//                         product: product,
//                         images: images,
//                         user: user,
//                         userId: req.session.user.user_id,
//                         isFavourite: !!fav
//                     });
//                 });
//             });
//         });
//     });
// });

// // Handle adding a product to favourites
// router.post("/:id", (req, res) => {
//     const { review, rating } = req.body;
//     const productId = req.params.id;

//     console.log(review);
//     console.log(rating);

//     // Takes the product info from the database
//     const query = "SELECT * FROM product WHERE id = ?";
//     global.db.get(query, [productId], (err, product) => {
//         if (err) {
//             return res.status(500).send(err.message);
//         }

//         // Insert the review into the reviews table
//         const reviewQuery = "INSERT INTO reviews (user_id, commenterName, commentContent, created_at, stars_given) VALUES (?, ?, ?, ?, ?)";
//         global.db.run(reviewQuery, [product.user_id, req.session.user.name, review, new Date().toLocaleString(), rating], (err, fav) => {
//             if (err) {
//                 return res.status(500).send(err.message);
//             }

//             res.redirect("/");
//         });
//     });
// });

// // Handle adding a product to favourites
// router.post("/favourites/add", (req, res) => {
//     const { productId, userId } = req.body;

//     console.log('productId:', productId, 'userId:', userId);

//     if (!productId || !userId) {
//         // console.error('Missing productId or userId');
//         return res.status(400).json({ success: false, message: 'Product ID and User ID are required.' });
//     }

//     // Check if the Favourite entry already exists
//     const checkFavQuery = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
//     global.db.get(checkFavQuery, [userId, productId], (err, row) => {
//         if (err) {
//             console.error('Database error:', err.message);
//             return res.status(500).json({ success: false, message: err.message });
//         }

//         if (row) {
//             // Entry already exists
//             return res.status(400).json({ success: false, message: 'Product is already in favourites.' });
//         }

//         // Insert into favourites table
//         const favQuery = "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)";
//         global.db.run(favQuery, [userId, productId], function(err) {
//             if (err) {
//                 // console.error('Database error:', err.message);
//                 return res.status(500).json({ success: false, message: err.message });
//             }
//             console.log('Product added to favourites:', { userId, productId });
//             res.json({ success: true });
//         });
//     });
// });

// // Handle adding a product to favourites
// router.post("/favourites/remove", (req, res) => {
//     const { productId, userId } = req.body;

//     const favQuery = "DELETE FROM favourites WHERE user_id = ? AND product_id = ?";
//     global.db.run(favQuery, [userId, productId], (err, fav) => {
//         if (err) {
//             return res.status(500).send(err.message);
//         }
//         console.log('Product removed from favourites:', { userId, productId });
//         res.json({ success: true });
//     });
// });

// module.exports = router;
