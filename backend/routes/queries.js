// queries.js

// Function to retrieve user details by email
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        // Query the database for a user with the specified email
        const userQuery = "SELECT * FROM users WHERE email = ?";
        global.db.get(userQuery, [email], (err, user) => err ? reject(err) : resolve(user));
    });
}

// Function to retrieve user details by id
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        // Query the database for a user with the specified ID
        const userQuery = "SELECT * FROM users WHERE id = ?";
        global.db.get(userQuery, [id], (err, user) => err ? reject(err) : resolve(user));
    });
}

// Function to retrieve all courses
const getAllSchools = () => {
    return new Promise((resolve, reject) => {
        // Query the database to get all courses
        const schoolsQuery = "SELECT * FROM courses";
        global.db.all(schoolsQuery, [], (err, schools) => err ? reject(err) : resolve(schools));
    });
}

// Function to retrieve listings by user ID
const getListings = (userId) => {
    return new Promise((resolve, reject) => {
        // Query the database for listings belonging to the specified user ID with 'not made' offer status
        const listingsQuery = "SELECT * FROM product WHERE user_id = ? AND offer_status = 'not made'";
        global.db.all(listingsQuery, [userId], (err, listings) => err ? reject(err) : resolve(listings));
    });
}

// Function to retrieve images for a list of products
const getImagesForProducts = (products) => {
    const listingsImages = {};
    const promises = products.map(product => {
        return new Promise((resolve, reject) => {
            // Query the database for images associated with each product ID
            global.db.all("SELECT * FROM product_images WHERE product_id = ?", [product.id], (err, images) => {
                if (err) return reject(err);
                listingsImages[product.id] = images;
                resolve();
            });
        });
    });
    // Wait for all image retrieval promises to resolve
    return Promise.all(promises).then(() => listingsImages);
}

// Function to retrieve reviews for a user
const getReviews = (userId) => {
    return new Promise((resolve, reject) => {
        // Query the database for reviews associated with the specified user ID
        const reviewsQuery = "SELECT * FROM reviews WHERE user_id = ?";
        global.db.all(reviewsQuery, [userId], (err, reviews) => err ? reject(err) : resolve(reviews));
    });
}

// Function to retrieve reviewer details for reviews
const getReviewersForReviews = (reviews) => {
    const reviewers = {};
    const promises = reviews.map(review => {
        return new Promise((resolve, reject) => {
            // Query the database for each reviewer's details using their ID
            const reviewerQuery = "SELECT * FROM users WHERE id = ?";
            global.db.get(reviewerQuery, [review.reviewer_id], (err, reviewer) => {
                if (err) return reject(err);
                reviewers[review.id] = reviewer;
                resolve();
            });
        });
    });
    // Wait for all reviewer retrieval promises to resolve
    return Promise.all(promises).then(() => reviewers);
}

// Function to retrieve transactions for a user
const getTransactions = (userId) => {
    return new Promise((resolve, reject) => {
        // Query the database for transactions involving the user either as the creator or offer maker, excluding 'not made' statuses
        const transactionsQuery = "SELECT * FROM product WHERE (user_id = ? OR offer_made_by = ?) AND offer_status != 'not made'";
        global.db.all(transactionsQuery, [userId, userId], (err, transactions) => err ? reject(err) : resolve(transactions));
    });
}

// Function to retrieve favourite products of a user
const getFavourites = (userId) => {
    return new Promise((resolve, reject) => {
        // Query the database for products marked as favourites by the specified user ID
        const favouritesQuery = `
            SELECT product.id, product.name, product.price, product.transaction_type
            FROM favourites
            JOIN product ON favourites.product_id = product.id
            WHERE favourites.user_id = ?
        `;
        global.db.all(favouritesQuery, [userId], (err, favourites) => err ? reject(err) : resolve(favourites));
    });
}

// Utility function to update user attributes
const updateUserAttribute = (attribute, value, id, res) => {
    new Promise((resolve, reject) => {
        // Update a specific attribute of a user in the database
        const query = `UPDATE users SET ${attribute} = ? WHERE id = ?`;
        global.db.run(query, [value, id], (err) => err ? reject(err) : resolve());
    })
    .then(() => res.redirect('/profile')) // Redirect to the profile page on success
    .catch(err => res.status(500).send(err.message)); // Send error response on failure
};

// Function to render transaction type HTML
const renderTransactionType = (type) => {
    const colors = {
        'Sell': '#FFA500', // Orange
        'Trade': '#9370DB', // Medium Purple
        'Free':  '#32CD32'  // Lime Green
    };
    
    const color = colors[type.trim()] || '#CCCCCC'; // Default color if type is not matched
    // Return HTML for the transaction type with the appropriate background color
    return `<div class="px-4 pt-1 pb-1.5 rounded-full text-white" style="background-color: ${color};">${type.trim()}</div>`;
};

// Function to retrieve all listings by category
const getListingsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        // Query the database for listings in the specified category with 'not made' offer status
        const query = "SELECT * FROM product WHERE LOWER(category) = ? AND offer_status = 'not made'";
        global.db.all(query, [category], (err, listings) => err ? reject(err) : resolve(listings));
    });
};

// Function to retrieve a product by its ID
const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        // Query the database for a product by its ID
        const query = "SELECT * FROM product WHERE id = ?";
        db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
    });
};

// Function to retrieve all images for a specific product
const getProductImagesById = (productId) => {
    return new Promise((resolve, reject) => {
        // Query the database for images associated with a specific product ID
        const query = "SELECT * FROM product_images WHERE product_id = ?";
        db.all(query, [productId], (err, rows) => err ? reject(err) : resolve(rows));
    });
};

// Function to insert a new product into the database
const insertProduct = (product) => {
    return new Promise((resolve, reject) => {
        // Insert a new product record into the database
        const query = "INSERT INTO product (user_id, name, description, price, category, transaction_type, condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        db.run(query, [product.userId, product.name, product.description, product.price, product.category, product.transaction_type, product.condition, new Date().toLocaleString()], function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

// Function to insert a new image for a product
const insertProductImage = (productId, imageData, imageType) => {
    return new Promise((resolve, reject) => {
        // Insert an image record for a specific product into the database
        const query = "INSERT INTO product_images (product_id, image, image_type) VALUES (?, ?, ?)";
        db.run(query, [productId, imageData, imageType], err => err ? reject(err) : resolve());
    });
};

// Function to update a product with new information
const updateProduct = (id, updates) => {
    return new Promise((resolve, reject) => {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(id);
        // Update the product record with new values based on the provided updates object
        const query = `UPDATE product SET ${fields} WHERE id = ?`;
        db.run(query, values, err => err ? reject(err) : resolve());
    });
};

// Function to delete a product from the database
const deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        // Delete a product record from the database using its ID
        const query = "DELETE FROM product WHERE id = ?";
        db.run(query, [id], err => err ? reject(err) : resolve());
    });
};

// Function to update the offer status of a product
const updateOfferMadeBy = (productId, userId) => {
    return new Promise((resolve, reject) => {
        // Update the 'offer_made_by' field of a product with the specified user ID
        const query = "UPDATE product SET offer_made_by = ? WHERE id = ?";
        db.run(query, [userId, productId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Function to update the offer status of a product
const updateOfferStatus = (productId, status) => {
    return new Promise((resolve, reject) => {
        // Update the 'offer_status' field of a product with the specified user ID
        const query = "UPDATE product SET offer_status = ? WHERE id = ?";
        db.run(query, [status, productId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Function to insert a new review into the database
const insertReview = (userId, reviewerId, review, createdAt, rating) => {
    return new Promise((resolve, reject) => {
        // Insert review data into the 'reviews' table
        const query = "INSERT INTO reviews (user_id, reviewer_id, content, created_at, stars_given) VALUES (?, ?, ?, ?, ?)";
        db.run(query, [userId, reviewerId, review, createdAt, rating], err => err ? reject(err) : resolve());
    });
};

// Function to retrieve all reviews for a specific user
const getReviewsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        // Get all reviews for a specific user from the 'reviews' table
        const query = "SELECT * FROM reviews WHERE user_id = ?";
        db.all(query, [userId], (err, rows) => err ? reject(err) : resolve(rows));
    });
};

// Function to update the rating of a user
const updateUserRating = (userId, rating) => {
    return new Promise((resolve, reject) => {
        // Update the user's rating in the 'users' table
        const query = "UPDATE users SET rating = ? WHERE id = ?";
        db.run(query, [rating, userId], err => err ? reject(err) : resolve());
    });
};

// Function to retrieve whether a user has favorited a specific product
const getProductFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        // Check if a user has favorited a specific product
        const query = "SELECT * FROM favourites WHERE user_id = ? AND product_id = ?";
        db.get(query, [userId, productId], (err, row) => err ? reject(err) : resolve(row));
    });
};

// Function to add a product to a user's favourites
const addProductToFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        // Add a product to the user's favourites
        const query = "INSERT INTO favourites (user_id, product_id) VALUES (?, ?)";
        db.run(query, [userId, productId], err => err ? reject(err) : resolve());
    });
};

// Function to remove a product from a user's favourites
const removeProductFromFavourites = (userId, productId) => {
    return new Promise((resolve, reject) => {
        // Remove a product from the user's favourites
        const query = "DELETE FROM favourites WHERE user_id = ? AND product_id = ?";
        db.run(query, [userId, productId], err => err ? reject(err) : resolve());
    });
};

module.exports = {
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
    renderTransactionType,
    getListingsByCategory,
    getProductById,
    getProductImagesById,
    insertProduct,
    insertProductImage,
    updateProduct,
    deleteProduct,
    updateOfferMadeBy,
    updateOfferStatus,
    insertReview,
    getReviewsByUserId,
    updateUserRating,
    getProductFavourites,
    addProductToFavourites,
    removeProductFromFavourites
};
