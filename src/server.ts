import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import https from 'https'
import bodyParser from 'body-parser'
import Product from './models/product.model'
import { Member } from './models/member.model'
import db from './models'
import { doOnAllergenIfExist } from './service/allergen.servcie'

// TODO during migration to docker move to env
const URL = 'https://world.openfoodfacts.org'
const ALERGENS_PATH = '/allergens.json'
const productPath: (barcode: string) => string = function (barcode) { return `${URL}/api/v0/product/${barcode}.json` }
const PORT = 3000

const ENDPOINT_ALL_ALLERGENS = '/allergens/all'
const ENDPOINT_ADD_PRODUCT = '/products/add'
const ENDPOINT_ADD_ALLERGEN_TO_MEMBER = '/allergens/add/:Name/:Surname'
const ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER = '/products/:Name/:Surname'
const ENDPOINT_ADD_MEMBER = '/member/add'
const ENDPOINT_GET_MEMBER = '/members'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to the database!");
    })
    .catch((err: any) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
    });

// Proxy endpoint
app.get(ENDPOINT_ALL_ALLERGENS, (req, res) => {
    https.get(URL + ALERGENS_PATH, (allergensRes) => {
        let body = ""
        allergensRes.on("data", (chunk) => { body += chunk })
        allergensRes.on("end", () => {
            try {
                var allergens = JSON.parse(body)
            } catch (err) {
                console.error(err)
            }
            if (!!allergens) {
                res.send({
                    "status": 200,
                    "allergens": allergens
                }).end()
            }else{
                res.send({
                    "status": 500
                }).end()
            }
        })
    })
})

app.post(ENDPOINT_ADD_PRODUCT, (req, res) => {
    // valid req
    req.body.barcode ?? res.send({ "status": 404 })
    // get product from open food
    https.get(productPath(req.body.barcode), (productRes) => {
        let body = ""
        productRes.on("data", (chunk) => { body += chunk })
        productRes.on("end", async () => {
            try {
                var product = JSON.parse(body)
            } catch (err) {
                console.error(err)
            }
            if (product?.status_verbose == 'product found') {
                // get allergens id from product
                const allergnes = product.product.allergens.split(',').map(function (elem: string) { return { "id": elem } })
                console.log(allergnes)
                // save to db
                await new Product({
                    Name: product.product.generic_name,
                    Barcode: req.body.barcode,
                    Allergens: allergnes
                }).save()
                // send res
                res.send({
                    "status": 201,
                    "body": {
                        "message": "saved"
                    }
                })
            } else {
                res.send({
                    "status": 202,
                    "body": {
                        "message": `no product with barcode "${req.body.barcode}"`
                    }
                })
            }
            res.end()
        })
    }).on("error", (error) => {
        console.log(error.message)
    })
})

// ?? add group
// ?? delete group

// add member
app.post(ENDPOINT_ADD_MEMBER, async (req, res) => {
    (req.body.Name || req.body.Surname) ?? res.send({ 'status': 404 })
    console.log(req.body)
    await new Member({
        Name: req.body.Name,
        Surname: req.body.Surname,
        Allergens: req.body.Allergens ?? []
    }).save()
    res.send({
        "status": 201
    })
})

app.get(ENDPOINT_GET_MEMBER, async (req, res) => {
    try {
        res.send({
            "status": 200,
            "members": await Member.find({})
        })
    } catch (e) {
        console.log(e)
        res.send({
            "status": 500
        })
    }
})
// ?? update member
// ?? delete member

app.post(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, (req, res) => {
    // valid req
    req.body.allergen ?? res.send({ "status": 400 })

    // check if allergen exist
    https.get(URL + ALERGENS_PATH, async (allergensRes) => {
        let body = ""
        allergensRes.on("data", (chunk) => { body += chunk })
        allergensRes.on("end", async () => {
            try {
                var allergens = JSON.parse(body)
            } catch (err) {
                console.error(err)
            }
            if (!!allergens) {
                let isAllergen = await allergens.tags?.findOne((element: { id: string }) => element.id == req.body.allergen) ?? false
                if (isAllergen == false) {
                    res.send({
                        "status": 404,
                        "body": {
                            "message": `no allergen with name "${req.body.allergen}"`
                        }
                    })
                }
                console.log(isAllergen)
                // save to db
                let oldMember = await Member.findOneAndUpdate(
                    { Name: req.params.Name, Surname: req.params.Surname }, { Allergens: req.body.allergen }
                );
                console.log(oldMember)
                // send res
                res.send({
                    "status": 201,
                    "body": {
                        "message": "saved"
                    }
                })
            } else {
                res.send({ "status": 500 })
            }
            res.end()
        })
    }).on("error", (error) => {
        console.log(error.message)
    })
})

app.put(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, async (req, res) => {
    // valid request
    req.body.allergen ?? res.send({ "status": 404 })
    const member = await Member.findOne({ Name: req.params.Name, Surname: req.params.Surname }).exec()
    if (!!member) {
        // check if allergen exist
        const opts = { "member": member, Name: req.params.Name, Surname: req.params.Surname, allergenId: req.body.allergen }
        if (member.get('Allergens').indexOf(req.body.allergen) != -1) {
            res.send({ "status": 404, "body": { "message": `Member "${req.params.Name} ${req.params.Surname} had this allergen:${req.body.allergen}` } }).end()
            return
        }
        res.send(
            doOnAllergenIfExist(
                req.body.allergen,
                URL + ALERGENS_PATH, req,
                async (opts) => {
                    console.log(opts.member['Allergens'])
                    opts.member.Allergens.push(opts.allergenId)
                    await Member.findOneAndUpdate(
                        { Name: opts.Name, Surname: opts.Surname }, { Allergens: opts.member.Allergens }
                    );
                },
                (allergenId) => `No allergen with id "${allergenId}`,
                opts)
        ).end()
    } else {
        res.send({
            "status": 404,
            "body": {
                "message": `no member with name "${req.params.Name}" and surname "${req.params.Surname}"`
            }
        }).end()
    }
})

app.get(ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER, async (req, res) => {
    const member: any = await Member.findOne({ Name: req.params.Name, Surname: req.params.Surname }).exec()
    if (!!member) {
        console.log(member.Allergens)
        const products = await Product.find({ "Allergens.id": { $nin: member.Allergens } })
        res.send({ "status": 200, "body": { "products": products } })
    } else {
        res.send({
            "status": 404
        })
    }

})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app 

