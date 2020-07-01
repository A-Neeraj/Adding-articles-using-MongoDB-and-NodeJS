var express=require('express');
const path =require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const expressValidator=require('express-validator');
const flash=require('connect-flash');
const session=require('express-session');


mongoose.connect('mongodb://localhost/nodekb');
let db=mongoose.connection;

db.once('open',function(){
    console.log('Connected to MongoDB')
});

db.on('error',function(err){
    console.log(err);
});

const app=express();

//Bring in Models
let Article=require('./models/article');

//Load View Engine
app.set('views', path.join(__dirname,'views')); 
app.set('view engine','pug');

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

//Express Messages middleware
app.use(require('connect-flash')());
 app.use(function (req, res, next) {
   res.locals.messages = require('express-messages')(req, res);
   next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: (param,msg,value)=>{
        var namespace=param.split('.')
        ,root = namespace.shift()
        ,formParam=root;

        while(namespace.length){
            formParam+='['+namespace.shift()+']';
        }
        return{
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));

//Home Route
app.get('/',(req,res)=>{
    Article.find({},function(err, articles){
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{
                articles:articles
            });
        }
        
    }); 
});

//Route Files
let articles=require('./routes/articles');
app.use('/articles',articles);

//Start Server
app.listen(5000,()=>{
    console.log('Server started')
});