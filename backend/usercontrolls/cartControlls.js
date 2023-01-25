const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const collection = require("../config/collection");

const addToCart = asyncHandler(async (req, res) => {
    const proId = req.body.ProId;
    const userId = req.body.userId;
    const color = req.body.color;
    const size = req.body.size;
    const proObj = {
      item: proId,
      quantity: 1,
      color,
      size,
    };
  
    let userCart = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .findOne({ userId: parseInt(userId) });
    if (userCart) {
      let proExist = userCart.products.findIndex(
        (product) =>
          product.item == proId && product.color == color && product.size == size
      );
      if (proExist != -1) {
        const incquantity = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { userId: userId, "products.item": proId },
            {
              $inc: { "products.$.quantity": 1 },
            }
          );
        if (incquantity) {
          res.status(200).json("quantity updated");
        } else {
          res.status(500).json("Somthing went wrong...");
        }
      } else {
        const update = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { userId: parseInt(userId) },
            {
              $push: { products: proObj },
            }
          );
        if (update) {
          res.status(200).json("Product Added");
        } else {
          res.status(500).json("Something went wrong....");
        }
      }
    } else {
      let cartObj = {
        userId: userId,
        products: [proObj],
      };
      const insert = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .insertOne(cartObj);
      if (insert) {
        res.status(200).json("Cart updated");
      } else {
        res.status(500).json("Something went wrong....");
      }
    }
});

const getCartProduct=asyncHandler(async(req,res)=>{
    const userId = req.params.id;
  let cartItems = await db
    .get()
    .collection(collection.CART_COLLECTION)
    .aggregate([
      {
        $match: { userId: parseInt(userId) },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          item: "$products.item",
          quantity: "$products.quantity",
          selectedcolor: "$products.color",
          selectedsize: "$products.size",
        },
      },
      {
        $lookup: {
          from: collection.PRODUCT_COLLECTION,
          localField: "item",
          foreignField: "id",
          as: "product",
        },
      },
      {
        $project: {
          item: 1,
          quantity: 1,
          selectedcolor: 1,
          selectedsize: 1,
          product: { $arrayElemAt: ["$product", 0] },
        },
      },
    ])
    .toArray();
  if (cartItems) {
    res.status(200).json(cartItems);
  } else {
    res.status(401).json("Cart Empty");
  }
})

const removeProductFromCart=asyncHandler(async(req,res)=>{
    const UserID = req.body.userID;
    const ProductID = req.body.Product;
    const deletes = await db
      .get()
      .collection(collection.CART_COLLECTION)
      .updateOne(
        {
          userId: parseInt(UserID),
        },
        {
          $pull: { products: { item: ProductID } },
        }
      );
  
    if (deletes) {
      res.status(200).json("deleted");
    } else {
      res.status(500).json("Somthing went wrong....");
    }
})


module.exports = {addToCart,getCartProduct,removeProductFromCart};
