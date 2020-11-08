import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import https from 'https'
import bodyParser from 'body-parser'
import { RSA_NO_PADDING } from 'constants';

// TODO during migration to docker move to env
const URL = 'https://world.openfoodfacts.org'
const ALERGENS_PATH = '/allergens.json'
const productPath: (barcode: string) => string = function (barcode) { return `${URL}/api/v0/product/${barcode}.json` }
const PORT = 3000

const ENDPOINT_ALL_ALLERGENS = '/allergens/all'
const ENDPOINT_ADD_PRODUCT = '/products/add'
const ENDPOINT_ADD_ALLERGEN_TO_MEMBER = '/allergens/add/:friendName/:allergenName'
const ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER = 'products/?friendName'

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// Proxy endpoint
app.get(ENDPOINT_ALL_ALLERGENS, createProxyMiddleware({
    target: URL + ALERGENS_PATH,
    changeOrigin: true,
}));


app.post(ENDPOINT_ADD_PRODUCT, (req, res) => {
    // valid req
    req.body.barcode ?? res.send({ "status": 404 })
    
    // get product from open food
    https.get(productPath(req.body.barcode), (product_res) => {
        let body = ""
        product_res.on("data", (chunk) => { body += chunk })
        product_res.on("end", () => {
                try{
                var product = JSON.parse(body);
                }catch(err){
                    console.error(err)
                }
                if (product?.status_verbose == 'product found') {
                    // get allergens from product
                    
                    // save to db
            
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
            });
    }).on("error", (error) => {
        console.log(error.message)
    })  
})

// ?? add group
// ?? delete group

// add member
// ?? update member
// ?? delete member

app.post(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, (req, res) => {
    // valid req

    // check if allergen exist

    // add to db

    // response 
})

app.put(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, (req, res) => {
    // valid request

    // check if allergen exist

    // update in db

    // response
})

app.post(ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER, (req, res) => {
    // valid request

    // get from db product which not have banned allergens for member 

    // response
})
app.listen(PORT, () => console.log(`APP listen on PORT ${PORT}`));