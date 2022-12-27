const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

//List of files extensions allowed as images
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

//Multer setup for Product image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploError = new Error('Invalid image type !');

        if (isValid) {
            uploError = null;
        }

        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        //const fileName = file.originalname.split(' ').join('-');
        //const extension = FILE_TYPE_MAP[file.mimetype];
        //cb(null, `${fileName}-${Date.now()}.${extension}`);
        //-->result:"http://localhost:3000/public/upload/flower.png-1672150684225.png"

        let extArray = file.mimetype.split(" ").join('-');
        let extension = extArray[extArray.length - 1];
        cb(null, `${file.fieldname}-${Date.now()}.${extension}`);
    }
})

const uploadOptions = multer({ storage: storage })

// Get a List of Products
router.get(`/`, async (req, res) => {

    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);
})

//Product Details :Get a specific Product by id
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product);
})


//Add a Product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category !');

    //Error msg if the request don't have an image 
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request !');

    const fileName = req.file.filename;
    //EX: http://localhost:3000/public/upload/image-27112022.png
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,  //EX: http://localhost:3000/public/upload/image-27112022.png
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product)
        return res.status(500).send('The product cannot be created')

    res.send(product);
})

//Updating a Product
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id !');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category !');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product !');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct);
})

//Delete a product
router.delete('/:id', async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);

    if (!product)
        return res.status(404).send('product not found!');

    res.status(200).send(product);
})

//Get Products Count : for Statistics
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count).clone();

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})

//Get Featured Products
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})


module.exports = router;