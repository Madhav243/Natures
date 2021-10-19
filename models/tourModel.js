const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
        // validate: [validator.isAlpha, 'Tour name must only contain characters'] //validator.js
      },
      slug: String,
      duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
      },
      maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
      },
      difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'], // values that alowed to insert
          message: 'Difficulty is either: easy, medium, difficult' //error message
        }
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666=> 46.6666=>47=>4.7
      },
      ratingsQuantity: {
        type: Number,
        default: 0
      },
      price: {
        type: Number,
        required: [true, 'A tour must have a price']
      },
      priceDiscount: {
        type: Number,
        validate: {
          validator: function(val) { // no arrow function because we have to use "this" in the function 
            // this only points to current doc on NEW document creation
            return val < this.price; //eg 100<200 return True
          },
          message: 'Discount price ({VALUE}) should be below regular price' // {VALUE} access to priceDiscount value
        }
      },
      summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
      },
      description: {
        type: String,
        trim: true
      },
      imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
      },
      images: [String],
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false
      },
      startDates: [Date],
      secretTour: {
        type: Boolean,
        default: false
      },
      startLocation: {
        // GeoJSON
        type: { // necessary for GeoJson
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],// necessary for GeoJson
        address: String,
        description: String
      },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String,
          day: Number
        }
      ],
      guides: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User' // child referencing 
        }
      ]
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );


tourSchema.index({ price: 1, ratingsAverage: -1 });// 1 sorting in ascending order and -1 for descending order //compound index 
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual populate // zayada smj nahi aaya (use kiya hai takee yeh virtual populate ho jae and reviewModal me populate krne me zayada time na lge)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // field in other Modal
  localField: '_id' 
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create(), not on insertmany function and not on update
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) { // embedded "guides" (users) data in tours document
//   const guidesPromises = this.guides.map(async id => await User.findById(id)); // return array of promises
//   this.guides = await Promise.all(guidesPromises); // will store results of promises
//   next();
// });



// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
  tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
  
    this.start = Date.now();
    next();
  });
  
  tourSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
    });
  
    next();
  });
  // tourSchema.post(/^find/, function(docs, next) {
  //   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  //   next();
  // });
  
  // AGGREGATION MIDDLEWARE
  tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  
    next();
  });



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;