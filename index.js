const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const MongoClient = require('mongodb').MongoClient

const app = express();
var port = process.env.PORT || 80

app.listen(port, () => console.log(`Server is listening on port ${port}...`));

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

// Connect to MongoDB client
connectionString = 'mongodb+srv://recipe-db-user2:p6BkVsHOfQ9LVyUe@cluster0.zmc5f.mongodb.net/Cluster0?retryWrites=true&w=majority',


MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('drew-homepage-db')
        const recipesCollection = db.collection('recipes')

        app.use(express.static('public'));

        app.get('/recipes', (req, res) => {
            db.collection('recipes').find().toArray()

                .then(results => {
                    res.send(results)
                    res.status(200).end()
                })
                .catch(error => console.error(error))
        })

        app.post('/recipes', (req, res) => {
            console.log(req.body)
            recipesCollection.insertMany(req.body)

                .then(result => {
                    console.log(result)
                    res.status(201).end()
                })
        })

    })
    .catch(error => console.error(error))