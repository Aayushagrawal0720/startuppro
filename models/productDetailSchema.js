const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema({
    product_title: {
        type: String,
        required: true,
    },
    picUrl: {
        type: String,
        default: "/default_product.jpg",
    },
    date: {
        type: Date,
        required: true,
    },
});

module.exports = productDetailSchema;
