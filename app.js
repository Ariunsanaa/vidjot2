const express = require('express');
const port = 5000;
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();
app.use(express.static("public"));
// Connect to Mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
    useMongoClient: true
})
.then(()=>console.log('MongoDB Connected'))
.catch(err=>console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');


// Body Parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Method Override
app.use(methodOverride('_method'));


//Express Session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Index route
app.get('/', (req, res)=>{
    const title="Welcome Everyone";
    res.render('index',{
        title: title
    });
});

app.use(flash());
// Global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// About route
app.get('/about', (req, res)=>{
    res.render('about');
});


//Idea Index Page
app.get('/ideas', (req, res)=>{
    Idea.find({})
        .sort({date: 'desc'})
        .then(ideas=>{
            res.render('ideas/index', {
                ideas: ideas
            });
        });
    //res.render('ideas/index');
});


// Add Ideas Form
app.get('/ideas/add', (req, res)=>{
    res.render('ideas/add');
});

// Edit Ideas Form
app.get('/ideas/edit/:id', (req, res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea=>{
        res.render('ideas/edit', {
            idea: idea
        });
    });
    
});


// Process Form
app.post('/ideas', (req, res)=>{
    // res.send('Ok');
    // console.log(req.body);
    let errors = [];
    if(!req.body.title){
        errors.push({text:'Please add a title'});
    }
    if(!req.body.details){
        errors.push({text: 'Please add some details'});
    }
    if(errors.length>0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
     } else{
         const newUser={
             title: req.body.title,
             details: req.body.details,
         }
        new Idea(newUser)
         .save()
         .then(idea=>{
            req.flash('success_msg', 'Video idea added');
             res.redirect('/ideas');
         })
        // res.send('Passed');
            console.log(req.body);
        }
});

// Edit Form process
app.put('/ideas/:id',(req, res)=>{
    //res.send('PUT');
    Idea.findOne({
        _id:req.params.id
    })
    .then(idea=>{
        // new values
        idea.title=req.body.title;
        idea.details = req.body.details;

        idea.save()
            .then(idea=>{
                req.flash('success_msg', 'Video idea updated');
                res.redirect('/ideas');
            })
});
});

// Delete Idea
app.delete('/ideas/:id', (req, res)=>{
    //res.send('DELETE');
    Idea.remove({_id: req.params.id})
        .then(()=>{
            req.flash('success_msg', 'Video idea removed');
            res.redirect('/ideas');
        });
});

// App Listen
app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});
