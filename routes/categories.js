const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

// Get a List of Categories
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.send(categoryList);
})

//Category Details :Get a specific Category by id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({ message: 'The category with the given ID was not found.' })
    }
    res.status(200).send(category);
})


//Add a Category
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        image: req.body.image
    })
    category = await category.save();

    if (!category)
        return res.status(404).send('the category cannot be created !')

    res.send(category);
})

//Updating a Category
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    )

    if (!category)
        return res.status(400).send('the category cannot be created!')

    res.send(category);
})


//Delete a Category
router.delete('/:id', async (req, res) => {
    const category = await Category.findByIdAndRemove(req.params.id);

    if (!category)
        return res.status(404).send('category not found!');

    res.status(200).send(category);
})



module.exports = router;