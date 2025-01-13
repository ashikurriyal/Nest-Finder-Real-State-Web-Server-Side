const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5300;


app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://nestfinder-ce7a3.web.app',
        'https://nestfinder-ce7a3.firebaseapp.com'
    ]
}));


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozyesnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();
        // Send a ping to confirm a successful connection
        //await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //Collections
        const usersCollection = client.db('NestFinderDB').collection('users')
        const propertiesCollection = client.db('NestFinderDB').collection('properties')
        const wishlistCollection = client.db('NestFinderDB').collection('wishlist')
        const requestedCollection = client.db('NestFinderDB').collection('requested')
        const reviewsCollection = client.db('NestFinderDB').collection('reviews')



        //users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const assignment = req.body;
            const result = await usersCollection.insertOne(assignment)
            res.send(result);
        })

        //Collectuser

        app.get('/collectUser/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }

            const result = await usersCollection.findOne(query)
            res.send(result);
        })




        //admin role
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })

        //agent role
        app.patch('/agents/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'agent'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })
        app.get('/agents', async (req, res) => {
            const email = req.query.email
            // console.log(email)
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let agent = false
            if (user) {
                agent = user?.role === 'agent'
            }
            res.send({ agent })
        })

        //add property from agent
        app.post('/properties', async (req, res) => {
            const property = req.body;
            const result = await propertiesCollection.insertOne(property)
            res.send(result)
        })

        //my added property api by email
        app.get('/properties', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = { agentEmail: email }
            const result = await propertiesCollection.find(query).toArray()
            res.send(result)
        })

        //manage properties for admin from properties, where load all properties
        app.get('/allProperties', async (req, res) => {
            const result = await propertiesCollection.find().toArray()
            res.send(result)
        })



        //verify or reject property
        app.patch('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const { status } = req.body; // Get the status from the request body
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: status // Update the status based on the request body
                }
            };
            const result = await propertiesCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // Get all verified properties
        app.get('/verifiedProperties', async (req, res) => {
            const filter = { status: 'verified' };
            const properties = await propertiesCollection.find(filter).toArray();
            res.send(properties);
        });

        app.get('/propertyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await propertiesCollection.findOne(query);
            res.send(result)
        })


        //wishlist 
        app.post('/wishlist', async (req, res) => {
            const wishlist = req.body;
            const result = await wishlistCollection.insertOne(wishlist)
            res.send(result)
        })

        //get wishlist api by email
        app.get('/wishlist', async (req, res) => {
            const email = req.query.email
            // console.log(email)
            const query = { email: email }
            const result = await wishlistCollection.find(query).toArray()
            res.send(result)
        })

        //make offer get
        app.get('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await wishlistCollection.findOne(query)
            res.send(result)
        })

        //make offer post 
        /* app.post('/requested', async (req, res) => {
            const requested = req.body;
            const query = {propertyId: requested?.propertyId}
            // console.log(query)
            const exist = await requestedCollection.findOne(query)
            if(exist){
                return res.send({message: 'Your previous offer is already pending', insertedId:null})
            }
            const result = await requestedCollection.insertOne(requested)
            res.send(result)
        }) */

        app.post('/requested', async (req, res) => {
            const requested = req.body;
            const result = await requestedCollection.insertOne(requested)
            res.send(result)
        })

        //get property bought for user by email
        app.get('/requested/:email', async (req, res) => {
            const email = req.params.email
            const query = { buyerEmail: email }

            const result = await requestedCollection.find(query).toArray()
            res.send(result);
        })

        //manage requested properties for agent from requested, where load all requested properties
        app.get('/allRequestedProperties', async (req, res) => {
            const result = await requestedCollection.find().toArray()
            res.send(result)
        })

        //verify or Reject request property
        app.patch('/requested/:id', async (req, res) => {
            const id = req.params.id;
            const { offerStatus } = req.body; // Get the status from the request body
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    offerStatus: offerStatus // Update the status based on the request body
                }
            };
            const result = await requestedCollection.updateOne(filter, updatedDoc);

            if (offerStatus === 'accepted') {
                const offer = await requestedCollection.findOne(filter);
                const propertyId = offer.propertyId;

                // Reject other offers for the same property
                const rejectFilter = {
                    propertyId: propertyId,
                    _id: { $ne: new ObjectId(id) }
                };
                const rejectDoc = {
                    $set: {
                        offerStatus: 'rejected'
                    }
                };
                await requestedCollection.updateMany(rejectFilter, rejectDoc);
            }
            res.send(result);
        });

        //review get
        app.get('/propertyReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await propertiesCollection.findOne(query);
            res.send(result)
        })

        //reviews post
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews)
            res.send(result)
        })

        //get reviews
        app.get('/allReviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        })

        //delete review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).send({ message: 'Review deleted successfully' });
                } else {
                    res.status(404).send({ message: 'Review not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'An error occurred', error });
            }
        });

        app.get('/getReviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { propertyId: id }
            const result = await reviewsCollection.find(query).toArray();
            res.send(result)
        })

        //reviews by email for user
        app.get('/myReviews', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const result = await reviewsCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/myReviews/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).send({ message: 'Review deleted successfully' });
                } else {
                    res.status(404).send({ message: 'Review not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'An error occurred', error });
            }
        });
        





    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Nest Finder Server is OnGoing!')
})
app.listen(port, () => {
    console.log(`Server is running on port${port}`)
})