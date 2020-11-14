import mongoose from 'mongoose'

const Product = mongoose.model(
    "Product",
    new mongoose.Schema(
        {
            Name: String,
            Barcode: String,
            Allergens:[{
                id:String
            }]
        },
        {
            timestamps: true
        }
    )
);

export default Product 