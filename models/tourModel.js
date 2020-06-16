/* eslint-disable */

const mongoose = require('mongoose')
const slugify=require('slugify')
const validator=require('validator')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'a tour must have a price'],
        unique: true,
        trim:true,
        maxlength:[40,'a tour name must be less than or equal to 40 characters'],
        minlength: [10, 'a tour name must be greater than 10 characters'],
        // validate:[validator.isAlpha,'tour name must only contain characters']
    },
    
    slug:String,

    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{ //for strings
            values:['easy', 'medium', 'difficult'],
            message:'Difficulty is either easy/medium/difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min:[1,'rating must be atleast 1.0'], //works for dates as well
        max: [5, 'rating must be below 5.0'],

    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price: {
        type: Number,
        required: [true, 'a tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{ //WONT WORK FOR UPDATE
            validator: function (val) {
                //this only points to current doc on new document
                return val < this.price
            },
            message:'Discount price ({VALUE}) should be less than regular price'   
        }
        

    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a description']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    }
   
},{
    toJSON:{virtuals:true},
    toObject: { virtuals: true }
})


//dont use arrow function as we are using this for referring to current document
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})


//document middleware
//runs before save()  and create() sampleSchema ,but not on insertMany
//this will add a slug field to each document which contains the lowercase of name eg- slug:'the tour'
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true})
    next()
})

tourSchema.pre('save', function (next) {
  console.log('will save document....')
  next();
});

tourSchema.post('save',function(doc,next){
    console.log(doc)
    next()
})


//query middleware
//this refers to query and not document
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find',function(next){
  this.find({ secretTour: { $ne: true } }); //run middleware for find method
  this.start=Date.now()
  next();
});

tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now()-this.start} milliseconds`)
    console.log(docs)

    next()
})

//this poinrt to aggragation object
tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next()
})

const Tour = mongoose.model('Tour', tourSchema)


module.exports=Tour