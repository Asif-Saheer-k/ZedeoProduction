const express = require("express");
const { verifyToken } = require("../middlewares/jwtTokenverification");
const router = express.Router();
const {addToCart,getCartProduct,removeProductFromCart}=require('../usercontrolls/cartControlls');
const { route } = require("./authuserRoutes");

router.route("/add-to-cart").post(addToCart);
router.route("/get-cart-product/:id").get(getCartProduct)
router.route('/remove-product-form-cart').post(removeProductFromCart)
module.exports = router;
