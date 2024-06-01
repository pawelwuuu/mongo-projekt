const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.connect('mongodb://localhost:27017/local', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        seedDatabase();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    });

async function seedDatabase() {
    const products = [
        {
            nazwa: "Ogorek",
            cena: 5.99,
            opis: "Polski ogorek",
            ilosc: 1,
        },
        {
            nazwa: "Marchew",
            cena: 2.99,
            opis: "Polski marchewka",
            ilosc: 1,
        },
        {
            nazwa: "Kafelki premium",
            cena: 550.99,
            opis: "Kafelki",
            ilosc: 10,
            jednostka_miary: 'm2'
        }
    ];

    try {
        await Product.insertMany(products);
        console.log('Data seeded successfully');
    } catch (error) {
        console.error('Error seeding data', error);
    } finally {
        mongoose.connection.close();
    }
}
