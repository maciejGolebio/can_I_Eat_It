import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import https from 'https'
import bodyParser from 'body-parser'

// TODO during migration to docker move to env
const URL = 'https://world.openfoodfacts.org'
const ALERGENS_PATH = '/allergens.json'
const productPath: (barcode: string) => string = function (barcode) { return `${URL}/api/v0/product/${barcode}.json` }
const PORT = 3000

const ENDPOINT_ALL_ALLERGENS = '/allergens/all'
const ENDPOINT_ADD_PRODUCT = '/products/add'
const ENDPOINT_ADD_ALLERGEN_TO_MEMBER = '/allergens/add/:friendName'
const ENDPOINT_GET_ALLOWED_PRODUCT_TO_MEMBER = 'products/?friendName'

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

// Proxy endpoint
app.get(ENDPOINT_ALL_ALLERGENS, createProxyMiddleware({
    target: URL + ALERGENS_PATH,
    changeOrigin: true,
}))


app.post(ENDPOINT_ADD_PRODUCT, (req, res) => {
    // valid req
    req.body.barcode ?? res.send({ "status": 404 })
    
    // get product from open food
    https.get(productPath(req.body.barcode), (productRes) => {
        let body = ""
        productRes.on("data", (chunk) => { body += chunk })
        productRes.on("end", () => {
                try{
                var product = JSON.parse(body)
                }catch(err){
                    console.error(err)
                }
                if (product?.status_verbose == 'product found') {
                    // get allergens from product
                    let allergnes  =product.product.allergens.split(',')
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
            })
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
    req.body.allergen ?? res.send({ "status": 404 })
    // check if member exist

    // check if allergen exist
    https.get(URL+ALERGENS_PATH, (allergensRes) => {
        let body = ""
        allergensRes.on("data", (chunk) => { body += chunk })
        allergensRes.on("end", () => {
                try{
                var allergens = JSON.parse(body)
                }catch(err){
                    console.error(err)
                }
                if (!!allergens) {
                    let isExist= allergens?.tags?.find((element:{name:string})=> element.name == req.body.allergen) ?? false 
                    if(isExist == false){
                        res.send({
                            "status": 202,
                            "body": {
                                "message": `no allergen with name "${req.body.allergen}"`
                            }
                        })
                    }
                    console.log(isExist)
                    // save to db
                    
                    // send res
                    res.send({
                        "status": 201,
                        "body": {
                            "message": "saved"
                        }
                    })
                } else {
                    res.send({ "status": 404 })   
                }
                res.end() 
            })
    }).on("error", (error) => {
        console.log(error.message)
    })
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
app.listen(PORT, () => console.log(`APP listen on PORT ${PORT}`))