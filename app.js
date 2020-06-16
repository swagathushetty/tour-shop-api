/* eslint-disable */

const express=require('express')
const morgan=require('morgan')

const AppError=require('./utils/appError')
const globalErrorHandler=require('./controllers/errorController')
const app=express()

const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes')

if(process.env.NODE_ENV==='development'){
    app.use(morgan("dev"));
}
app.use(express.json())
app.use(express.static(`${__dirname}/public`))

app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString()
    next()
})



// app.get('/api/v1/tours',getAlltours)
// app.get('/api/v1/tours/:id',getTour)
// app.post('/api/v1/tours',createTour)
// app.patch('/api/v1/tours/:id',updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)


//middleware routing
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users",userRouter)

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`Cant find ${req.originalUrl} on the server`
    // })

    // const err = new Error(`Cant find ${req.originalUrl} on the server`);
    // err.status='fail'
    // err.statusCode=404
    // next(err) //skip all middlewares and to go errror middleware

    next(new AppError(`Cant find ${req.originalUrl} on the server`,404));
})

app.use(globalErrorHandler)

module.exports=app
