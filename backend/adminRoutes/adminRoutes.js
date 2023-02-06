const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtTokenverification");
const {
  AdminLogin,
  ViewALLuser,
  DeleteUser,  
  AddBanner,
  ViewAllBanner,
  DeleteBanner,
  AddCategory,
  ViewCategory,
  DeleteCategory,    
  AddSubCategory, 
  Addproducts,
  ImageUploading,
  ViewStockProducts,
  UpdateProduct,
  DeleteProduct,
  viewStockManagementProducts,
  viewAllProducts
} = require("../adminControlls/adminControlls");
const { viewSingleProduct } = require("../usercontrolls/commernControlls");

router.route("/login").post(AdminLogin);
router.route("/view-allusers").get(verifyToken, ViewALLuser);
router.route("/delete-user/:id").delete(verifyToken, DeleteUser);
router.route("/add-banner").post(verifyToken, AddBanner);
router.route("/view-all-banner").get(verifyToken, ViewAllBanner);
router.route("/delete-banner/:id").delete(verifyToken, DeleteBanner);
router.route("/add-category").post(verifyToken, AddCategory);
router.route("/view-all-category").get(verifyToken, ViewCategory);
router.route("/delete-category/:id").get(verifyToken, DeleteCategory);
router.route("/add-sub-category").post(verifyToken,AddSubCategory) 
router.route("/add-products").post(verifyToken,Addproducts)
router.route("/view-all-products").get(verifyToken,viewAllProducts)
router.route("/view-all-stock-management-product").post(viewStockManagementProducts)
router.route("/view-single-stock-management-product/:id").get(viewSingleProduct)
router.route("/update-products").post(verifyToken,UpdateProduct)
router.route('/delete-products').post(verifyToken,DeleteProduct)
router.route("/image-uploading").post(ImageUploading)  

module.exports = router; 
      