const dbConfig = require("../config/db.mongo.config.js");

import mongoose from "mongoose"

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false)
const db:any = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

export default db