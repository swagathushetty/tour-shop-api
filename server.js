/* eslint-disable */
const mongoose = require('mongoose')

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //we put it above so that app.js file also has access to it
const app = require('./app');

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('connected to DB succesfully !!!');
  });









const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});


//TEST