const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");

const viewSingleProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const product = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .findOne({ _id: ObjectId(id) });
  if (product) {
    res.status(200).json(product);   
  } else {
    res.status(404).json("Something went Wrong");
  }  
}); 
module.exports = { viewSingleProduct };
