/* eslint-disable */
const Tour=require('./../models/tourModel')

const APIFeatures=require('../utils/apiFeatures')

exports.checkBody = (req, res, next) => {
  console.log('enterd middleware');
  console.log(req.body.name, req.body.price);
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'failed',
      message: 'missing name or price',
    });
  }


  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  (req.query.sort = '-ratingsAverage,price'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty');
  next();
};




exports.getAlltours =async(req, res) => {
  try {
       
        //execute query
         const features = new APIFeatures(Tour.find(), req.query)
           .filter()
           .sort()
           .limitFields()
           .paginate();


        const tours = await features.query;
        // console.log(tours)

        res.status(200).json({
          status: 'success',
          result: tours.length,
          data: {
            tours: tours,
          },
        });
      } catch(err){
          res.status(201).json({
            status: 'failed',
            message:err
          }); 
     }

}

exports.getTour = async(req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.findOne({_id:req.params.id}); can also be used

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(201).json({
      status: 'failed',
      message: err,
    });
  }
  
};



exports.createTour = async(req, res) => {

  try {

  const newTour=await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data:{
      tour:newTour
    }
  });

} catch(err){
   res.status(400).json({
    status: 'failed',
    message:err
  });
}


} 

  

  // console.log(req.body);
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId },req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   // eslint-disable-next-line no-unused-vars
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );

  

exports.updateTour =async (req, res) => {
  try {
        //runValidators makes the new data to be validated before updating
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });

        res.status(200).json({
          status: 'sucess',
          data: {
            tour: tour,
          },
        });
      } catch (err) {
    res.status(404).json({
      status: 'fail',
     message:err
    });
    
  }
  
};

exports.deleteTour =async (req, res) => {
  try {
        await Tour.findByIdAndDelete(req.params.id);

        //204 data doesnt exist
        res.status(204).json({
          status: 'sucess',
          data: null,
        });
      } catch (error) {
        
        res.status(400).json({
          status: 'fail',
          message: error,
        });
  }
  
};


exports.getTourStats=async(req,res)=>{
  try {
    //its a mongodb feature which mongoose also allows
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours:{$sum:1},
          numRatings:{$sum:'$ratingsQuantity'},
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort:{
          avgPrice:1
        }
      },
      {
        $match:{
          _id:{$ne:'easy'} //hide easy results
        }
      }
    ]);

     res.status(200).json({
       status: 'sucess',
       data: stats,
     });
    
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
    
  }
}

exports.getMonthlyPlan=async(req,res)=>{
  try {
    const year=req.params.year*1;
    const plan=await Tour.aggregate([
      {
        $unwind:'$startDates' //seperate starDates into a seperate document from the array
      },
      {
        $match:{
          startDates:{
            $gte:new Date(`${year}-01-01`),
            $lte:new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group:{
          _id:{$month:'$startDates'},
          numTourStarts:{$sum:1},
          tours:{$push:'$name'}
        }
      },
      {
        $addFields:{month:'$_id'} //renaming month field
      },
      {
        $project:{
          _id:0 //hides id
        }
      },
      {
        $sort:{numTourStarts:-1} //desc order
      },{
        $limit:12
      }
    ])


    res.status(200).json({
      status: 'success',
      data: {
        plan:plan
      },
    });
    
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
}


// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId = (req, res, next, val) => {
//   console.log(`tour id is ${val}`);

//   //check if data exist
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid Id',
//     });
//   }

//   next();
// };