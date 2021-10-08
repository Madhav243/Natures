const Tour= require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');



const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
const getAllTours = catchAsync(async (req, res,next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const tours = await features.query;

    return res.status(200).json({
      'status':'Success',
      'results':tours.length,
      'data':{tours}
    });

});

const getTour =catchAsync(async (req, res,next) => {
  const id = req.params.id ;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  return res.status(200).json({
    'status':'Success',
    'data':tour
  });
});

const createTour =catchAsync( async (req, res,next) => {
  const newTour = await Tour.create(req.body);

    return res.status(200).json({
      'status':'Success',
      'data':newTour
    });
  
});

const updateTour =catchAsync( async (req, res,next) => {
  
  const id = req.params.id;

  const tour = await Tour.findByIdAndUpdate(id,req.body,{
    new:true,//will return the updated object
    runValidators:true // run validators on update also
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });

  
});

const deleteTour = catchAsync(async (req, res,next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

    return res.status(204).json({
      status: 'success',
      data: null
    });

  
});

const getTourStats =catchAsync( async (req, res,next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

const getMonthlyPlan =catchAsync( async (req, res,next) => {
  const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });

});



module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
};
