const tourManager = require('../managers/tourManager');


const getAllTours= async (req,res)=>{
    try{
        const data = await tourManager.getAllTours();
        return res.status(200).json({
            'status':'success',
            'data':data
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
        const data = await tourManager.getTour(req.params.id);
        return res.status(200).json({
            'status':'success',
            'data':data
        });
    }catch(err){
        return res.status(500).json({
            'status':'error',
            'data':`Error : ${err}`
        });
    }
}


module.exports = {getAllTours,getTour};