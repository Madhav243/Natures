const tourWorker = require('../workers/tourWorker');

const getAllTours =async ()=>{
    try{
        const tours= await tourWorker.getAllTours();
        return tours;
    }catch(err){
        throw err;
    }
}

const getTour = async (id)=>{
    try{
        const tour = await tourWorker.getTour(id);
        return tour;
    }catch(err){
        throw err;
    }
}


module.exports = {getAllTours,getTour};