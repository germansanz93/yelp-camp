const mongoose = require('mongoose');
const Campground = require('../models/Campground')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//abajo: logica para ver si la conexion se realizo correctamente o si hubo algun problema y mostrarlo por consola
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '60a28bb31827710c201e5fa9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'http://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo laudantium in officiis illo. Adipisci vero minima, odit dolores sit, fugiat beatae et unde iste velit, iusto labore nam cum saepe.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dgeaiqw5x/image/upload/v1621688383/YelpCamp/kfiupeyqruvdhk1rdyvl.jpg',
                    filename: 'YelpCamp/kfiupeyqruvdhk1rdyvl'
                },
                {
                    url: 'https://res.cloudinary.com/dgeaiqw5x/image/upload/v1621688383/YelpCamp/cgan2kad9uiojwavomk7.jpg',
                    filename: 'YelpCamp/cgan2kad9uiojwavomk7'
                },
                {
                    url: 'https://res.cloudinary.com/dgeaiqw5x/image/upload/v1621688383/YelpCamp/eg25hpyqz1vqrncuzxwy.jpg',
                    filename: 'YelpCamp/eg25hpyqz1vqrncuzxwy'
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});