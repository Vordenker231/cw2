var path = require("path");
const express = require('express');
const app = express();

// the 'logger' middleware
app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    });
    

const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://olomolukmon:Barcelona23@cluster0.ljqkd.mongodb.net/', (err, client) => {
    db = client.db('mdx2');
})
 
app.use(express.json());

app.param('collectionName', (req, res, next, collectionName)=> {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/', (req, res, next) => {
res.send('Select a collection with /collection/:collectionName')
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers");    // allow CORS
    next();
  });

// display a message for root path to show the API is working
app.get('/', (req, res) =>{
    res.send ('Select a collection, e.g., /collection/messages')
});

//Path where static files are 
var imagePath = path.resolve(__dirname, "static");
app.use("/images", express.static(imagePath));
app.get("/orders/:id/photo", function(req, res) {
    res.sendFile(getProfilePhoto(req.params.id));
});


// retreive all the objects from a collection
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray ((e, results) => {
        if (e) return next(e)
        res.send(results)
    });
});

// retreive an object by mongodb ID
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) =>{
    req.collection.findOne(
        { _id: new ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send(result)
        })
})

// add an object
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next (e)
        res.send(results.ops)
    })
})

// update an object by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next (e)
            res.send ((result.result.n === 1) ?
            {msg: 'success'} : {msg: 'error'})
        })
})

// delete an object by ID
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ?
            {msg: 'success'} : {msg : 'error'})
        })
})


const port = process.env.PORT || 7000
app.listen(port, () =>{
    console.log ('server running on port' & 7000)
});
