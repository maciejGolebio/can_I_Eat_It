import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import https from 'https'

// TODO during migration to docker move to env
const URL = 'https://world.openfoodfacts.org' 
const ALERGENS_PATH = '/allergens.json'
const PRODUCT_PATH : (barcode:string) => string = function(barcode){return `/api/v0/product/${barcode}.json`}
const PORT = 3000

const ENDPOINT_ALL_ALLERGENS = '/allergens/all'
const ENDPOINT_ADD_PRODUCT = '/products/add/:barcode'
const ENDPOINT_ADD_ALLERGEN_TO_MEMBER = '/allergens/add/:friendName/:allergenName'
const ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER = '/friendName'
const app = express();

// Proxy endpoint
app.get(ENDPOINT_ALL_ALLERGENS, createProxyMiddleware({
    target: URL+ALERGENS_PATH,
    changeOrigin: true,
 }));

app.post(ENDPOINT_ADD_PRODUCT, (req,res)=>{
    // valid req

    // get product from open food
    
    // get allergens from product

    // save to db

    // send res

    res.send({
        "status":201,
        "body":{
            "message":"saved"
        }
    })
})

// add group
// ?? delete group

// add member
// ?? update member
// ?? delete member

app.post(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, (req,res)=>{
    // valid req

    // check if allergen exist

    // add to db

    // response 
})

app.put(ENDPOINT_ADD_ALLERGEN_TO_MEMBER, (req,res)=>{
    // valid request

    // check if allergen exist

    // update in db

    // response
})

app.post(ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER, (req, res)=>{
    // valid request

    // get from db product which not have banned allergens for member 

    // response
})
app.listen(PORT, () => console.log(`APP listen on PORT ${PORT}`));