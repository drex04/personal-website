"use strict";
// Import the dependency.
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_STRING;
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};
let client;
let clientPromise;
if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (hot module replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect()
        .then(client => {
            console.log('Connected to Database')
            const db = client.db('homepageDatabase')
            const recipesCollection = db.collection('recipes')

            app.get('/recipes', (req, res) => {
                // print full URL for debugging
                const protocol = req.protocol;
                const hostname = req.hostname;
                const path = req.originalUrl;

                const fullURL = protocol + "://" + hostname + path;
                console.log(fullURL);

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

}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
module.exports = clientPromise;