const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);


module.exports = {getAllReviews,getReview,createReview,updateReview,deleteReview};