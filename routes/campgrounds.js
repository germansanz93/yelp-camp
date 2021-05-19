const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/Campground');
const express = require('express');
const router = express.Router();
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Succesfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});


//tener en cuenta que la usar la variable captura cualquier cosa que haya ahi,
//por lo que al tener otras rutas que sean campgrounds/algo debemos ponerlas antes de esta
//para que se evaluen primero y como ultima opcion este la que usa la variable
//ya que de otra forma las capturara
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews', //populate anidado, hace populate a revieews y dentro de 
        populate: { //reviews hace populate a los author del review
            path: 'author'
        }
    }).populate('author');//luego hace populate a los author del camp
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id); //esta forma sirve tambien si no quiero hacer undestructurind de params
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //hizo spread sobre campground en body, porque de la forma que nombramos los parametros quedan agrupados dentro de campground
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}))

module.exports = router;