const express = require('express');
const router = express.Router();

const tourController = require('../controllers/tourController');

router
.route('/')
.get(tourController.getAllTours);


router
  .route('/:id')
  .get(tourController.getTour);

module.exports = router;