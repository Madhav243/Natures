const mongoose = require('mongoose');
const Tour = require('./tourModel');



const reviewSchema = new mongoose.Schema({
      review: {
        type: String,
        required: [true, 'Review can not be empty!']
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });// A user can write review for tour only once

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });
  
    this.populate({
      path: 'user',
      select: 'name photo'
    });
    next();
  });
  

reviewSchema.statics.calcAverageRatings = async function(tourId) { //static function that points to MODAL 
    const stats = await this.aggregate([ // this refers to MODAL
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },// no of ratings
          avgRating: { $avg: '$rating' }// calculate average of rating
        }
      }
    ]);
  
    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
  };

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
    //constructor points to MODAL
  });

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {// when review is updated or deleted , ratings should be calculated again
  this.r = await this.findOne(); // this will return one document (review) // we need tourid from that review //passing value from pre to post middleware
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);//this.r = review
  //this.r.constructor= Review MODAL 
  //this.r.tour = tourid whose rating we have to calculate again after deleting and updating review
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;