const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  );


const getAllTours = ()=>{
    return tours;
}

const getTour = (id)=>{
    const tour = tours.find(el => el.id === id);
    return tour;
}

module.exports = {getAllTours,getTour};

