const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const port = 3000;
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config');


app.use(cors());
app.options("*", cors());

//Middleware
app.use(express.json());
app.use(authJwt());
app.use(errorHandler);

//Routers
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

//MongoDB Database Connection 
mongoose.connect(process.env.CONNECTION_STRING, {
    dbName: 'oshop-data'
})
    .then(() => {
        console.log('Database Connection is Ready...')
    })
    .catch((err) => {
        console.log(err)
    })

//Server
app.listen(port, () => {
    console.log(api);
    console.log(`Oshop Listening on port ${port}`);
})
