const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Product = require('./models/product')
const {all} = require("express/lib/application");

const app = express();

mongoose.connect('mongodb://localhost:27017/local', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Could not connect to MongoDB', err);
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect('/products')
});

app.get('/products', async (req, res) => {
    try {
        const { nazwa, minPrice, maxPrice, minQuantity, maxQuantity, sortBy, order } = req.query;

        // Budowanie warunków filtrowania
        let filter = {};
        if (nazwa) {
            filter.nazwa = { $regex: nazwa, $options: 'i' }; // Filtrowanie nazw z ignorowaniem wielkości liter
        }
        if (minPrice) {
            filter.cena = { ...filter.cena, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filter.cena = { ...filter.cena, $lte: Number(maxPrice) };
        }
        if (minQuantity) {
            filter.ilosc = { ...filter.ilosc, $gte: Number(minQuantity) };
        }
        if (maxQuantity) {
            filter.ilosc = { ...filter.ilosc, $lte: Number(maxQuantity) };
        }

        // Budowanie opcji sortowania
        let sort = {};
        if (sortBy) {
            sort[sortBy] = order === 'desc' ? -1 : 1;
        }

        const products = await Product.find(filter).sort(sort);

        res.render('index', {products: products})
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

app.get('/addProduct', async (req,res) => {
    res.render('addProduct')
})

app.post('/products', async (req, res) => {
    try {
        const { name, price, description, quantity, unit } = req.body;

        const newProduct = new Product({
            nazwa: name,
            cena: price,
            opis: description,
            ilosc: quantity,
            jednostka_miary: unit
        });

        await newProduct.save();

        res.redirect('/products');
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
})

app.get('/products/:id',async (req,res) => {
    let product = await Product.find({_id: req.params.id}, {}, {})

    res.render('editProduct', {product: product[0]})
})

app.post('/products/:id',async (req,res) => {
    try {
        const { nazwa, cena, opis, ilosc, jednostka_miary } = req.body;
        const productId = req.params.id

        console.log(req.body)

        await Product.findOneAndUpdate(
            {_id: productId},
            {
                nazwa: nazwa,
                cena: cena,
                opis: opis,
                ilosc: ilosc,
                jednostka_miary: jednostka_miary
            }
        ).then(() => {
            console.log(`zaktualizowano danymi`)
        })

        res.redirect('/products')
    } catch (e) {
        console.log(e)
        res.send('Error during product editing.')
    }
})

app.delete('products/:id', async (req,res) => {
    try {
        await Product.deleteOne(
            {_id: req.params.id}
        ).then(() => {
            console.log(`usunieto ${req.params.id}`)
        })

        res.redirect('/')
    } catch (e) {
        console.log(e)
        res.status(500).send("nie udalo sie usunac")
    }

})

app.get('/raport', async (req,res) => {
    const all_products = await Product.find(null, null, null)

    res.render('raport', {products: all_products, raport_data: undefined})
})

app.post('/raport', async (req,res) => {
    const checked_names = []
    Object.entries(req.body).forEach((entry) => {
        checked_names.push(entry[0])
    })

    console.log(checked_names)
    const raport = await Product.aggregate([
        {
            $match: {
                nazwa: {$in: checked_names}
            }
        },
        {
            $project: {
                nazwa: 1,
                ilosc: 1,
                cena: 1,
                calokowita_wartosc: {$multiply: ["$cena", "$ilosc"]}
            }
        }
    ])


    res.render('raport', {products: undefined, raport_data: raport})
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});




