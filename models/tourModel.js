const mongoose = require('mongoose');
const slugify = require('slugify');

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
        max: [5, 'Rating must be below 5.0']
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
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );



// DOCUMENT MIDDLEWARE: runs before .save() and .create(), not on insertmany function and not on update
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
  tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
  
    this.start = Date.now();
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