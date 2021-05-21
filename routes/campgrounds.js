const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/Campground');
const express = require('express');
const router = express.Router();
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send('hi');
    })
// .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground))
//tener en cuenta que la usar la variable captura cualquier cosa que haya ahi,
//por lo que al tener otras rutas que sean campgrounds/algo debemos ponerlas antes de esta
//para que se evaluen primero y como ultima opcion este la que usa la variable
//ya que de otra forma las capturara

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;