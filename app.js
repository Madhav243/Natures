const express = require('express');

const app= express();
const routes = require('./routes');
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended:false}));
// app.use(bodyParser.json());
// or
app.use(express.json()); // middleware to add body to request


app.use('/',routes);

const port = 3000;


app.listen(port,(err)=>{
    if(err) console.log(`Error : ${err}`);
    else console.log(`App is running on the port ${port}`);
});