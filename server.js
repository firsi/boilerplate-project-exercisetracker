const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
process.env.MONGOLAB_URI = "mongodb+srv://firsi:jeNLrdjaimgthaEu@cluster0-tjplu.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true })

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})
// create schema and model
var Schema= mongoose.Schema;
var userSchema = new Schema({username: String});
var exerciseSchema = new Schema({
                userId: {type: Schema.Types.ObjectId, required: true},
                description:{type: String, required: true},
                duration: {type: Number, required: true} ,
                date: Date
});
var User = mongoose.model('User', userSchema);
var Exercise = mongoose.model('Exercise', exerciseSchema);

//Create a new user
app.post('/api/exercise/new-user', (req, res) => {
    
  User.findOne({username:req.body.username}, (error, username) => {
    if(error)return console.log(error);
    
    // if username doesn't exist insert it else display an error message
    if(username === null){
        User.create({username: req.body.username}, (error, username) => {
          if(error)return console.log(error);
          
          res.json(username);
        })
    }
    else{
      res.send("This username already exists, try another one");
    }
  })
      
})

// add exercise
app.post('/api/exercise/add', (req, res) => {
    User.findOne({_id: req.body.userId}, (error, user) => {
      if(error) return console.log(error);
      console.log(user);
      //if user exists we can add exercise to the database
      if(user != null){
          Exercise.create({
            userId : req.body.userId,
            description : req.body.description,
            duration : req.body.duration,
            date: req.body.date
          }, (error, exercise) => {
            if(error)return console.log(error);
              res.json(exercise);
          });
          
      }
      else{
        res.send({error:"The userId you entered doesn't exist"});
      }
    })
})

//show the results
app.get('/api/exercise/log',(req, res) => {
  var userId = req.query.userId;
  console.log(userId)
  User.findOne({_id: userId},(error, user) => {
      if(error){
        res.json({error:"Unknown user"});
        return console.log(error);
      
      }
      //if user exist we can retrieve information from the database
    else{
      Exercise.find({userId: userId})
      .select('description duration date -_id')
      .exec((error, exercise) => {
         res.json({
           _id:user._id,
           username:user.username,
           count:exercise.length,
           log:exercise
         }); 
      })
    }
  })
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
