

const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
const getAllTours= async (req,res)=>{
    try{
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
              tours
            }
          });
    }catch(err){
        return res.status(500).json({
            'status':'error',
            'data':`Error : ${err}`
        });
    }
}


const getTour = async (req,res)=>{
    try{
        const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
    }catch(err){
        return res.status(500).json({
            'status':'error',
            'data':`Error : ${err}`
        });
    }
}


module.exports = {getAllTours,getTour};