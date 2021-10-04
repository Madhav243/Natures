const Tour= require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
const getAllTours =async (req, res) => {
  try{
    // EXECUTE QUERY
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
  }catch(err){
    return res.status(400).json({
      'status':'Error',
      'data':err
    });
  }

};

const getTour =async (req, res) => {
try{
  const id = req.params.id ;
  const tour = await Tour.findById(id);
  return res.status(200).json({
    'status':'Success',
    'data':tour
  });
}catch(err){
  return res.status(400).json({
    'status':'Error',
    'data':err
  });
}

  


};

const createTour = async (req, res) => {
  try{
    const newTour = await Tour.create(req.body);

    return res.status(200).json({
      'status':'Success',
      'data':newTour
    });
  }catch(err){
    return res.status(400).json({
      'status':'Error',
      'data':err
    });
  }
  
  
};

const updateTour = async (req, res) => {
  
  try{
    const id = req.params.id;

    const tour = await Tour.findByIdAndUpdate(id,req.body,{
      new:true,
      runValidators:true
    });
    return res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  }catch(err){
    return res.status(400).json({
      'status':'Error',
      'data':err
    });
  }
  
  
};

const deleteTour = async (req, res) => {
  try{
   await Tour.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: 'success',
      data: null
    });
  }catch(err){
    return res.status(400).json({
      'status':'Error',
      'data':err
    });
  }

  
};

const getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};



module.exports = {getAllTours,getTour,createTour,updateTour,deleteTour,aliasTopTours,getTourStats,getMonthlyPlan};
