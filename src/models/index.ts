const dbConfig = require("../config/db.mongo.config.js");

import mongoose from "mongoose"

mongoose.Promise = global.Promise;

const db:any = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
//db.products = require("./product.model.js")(mongoose);

module.exports = db;