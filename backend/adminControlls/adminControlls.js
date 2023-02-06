const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const collection = require("../config/collection");
const generateToken = require("../utils/jwtToken");
const AWS = require("aws-sdk");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const ACCESS_KEY = "AKIAWJHY3CZLEPRCYZ35";
const SECRET_ACCESS_KEY = "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";
AWS.config.update({ region: "us-east-1" });

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_ACCESS_KEY,
});
let upload = multer({
  limits: 1024 * 1024 * 5,
  fileFilter: function (req, file, done) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      done(null, true);
    } else {
      done("Multer File Type in not supported");
    }
  },
});

const uploadS3 = (fileData) => {
  return new Promise((resovle, reject) => {
    const params = {
      Bucket: "moffa",
      Key: `${Date.now().toString()}.jpg`,
      Body: fileData,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        return resovle(data);
      }
    });
  });
};
const AdminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(process.env.ADMIN_EMAI, process.env.ADMIN_PASSWORD);
  if (email == process.env.ADMIN_EMAIL) {
    if (password == process.env.ADMIN_PASSWORD) {
      const token = generateToken(password);
      res.status(200).json({ token });
    } else {
      res.status(401).json("Invalid password");
    }
  } else {
    res.status(401).json("Invalid Email Address");
  }
});
const ViewALLuser = asyncHandler(async (req, res) => {
  try {
    const AllUsers = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    console.log(AllUsers);
    res.status(200).json(AllUsers);
  } catch (error) {
    res.status(400).json("No Records");
  }
});
const DeleteUser = asyncHandler(async (req, res) => {
  const ID = req.params.id;
  console.log(ID);

  const deleted = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .deleteOne({ CUST_ID: parseInt(ID) });

  if (deleted) {
    res.status(200).json("Deleted");
  } else {
    res.status(500).json("Somthing Went Wrong");
  }
});
const AddBanner = asyncHandler(async (req, res) => {
  console.log(req.body);
  const bannerData = req.body;
  const Insert = await db
    .get()
    .collection(collection.BANNER_COLLECTION)
    .insertOne(bannerData);
  if (Insert) {
    console.log(Insert);
    res.status(200).json("Succes");
  } else {
    res.status(401).json("Somthing Went Wrong");
  }
});
const ViewAllBanner = asyncHandler(async (req, res) => {
  const AllBanner = await db
    .get()
    .collection(collection.BANNER_COLLECTION)
    .find()
    .toArray();
  if (AllBanner) {
    res.status(200).json(AllBanner);
  } else {
    res.status(201).json("NO RECORDS");
  }
});
const DeleteBanner = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const DeleteBanner = await db
    .get()
    .collection(collection.BANNER_COLLECTION)
    .deleteOne({ _id: ObjectId(id) });
  if (DeleteBanner) {
    res.status(200).json("Success");
  } else {
    res.status(405).json("Somthing Went Wrong");
  }
});
const AddCategory = asyncHandler(async (req, res) => {
  const category = req.body;
  const update = await db
    .get()
    .collection(collection.CATEGORY_COLLECTION)
    .insertOne(category);
  if (update) {
    res.status(200).json(update);
  } else {
    res.status(500).json("Somthing Went Wrong");
  }
});

const ViewCategory = asyncHandler(async (req, res) => {
  const TotalCategory = await db
    .get()
    .collection(collection.CATEGORY_COLLECTION)
    .find()
    .toArray();
  if (TotalCategory) {
    res.status(200).json(TotalCategory);
  } else {
    res.status(500).json("Somthing Went Wrong");
  }
});
const DeleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCategory = await db
    .get()
    .collection(collection.CATEGORY_COLLECTION)
    .deleteOne({ _id: ObjectId(id) });
  if (deleteCategory) {
    res.status(200).json(deleteCategory);
  } else {
    res.status(500).json("Somthing Went Wrong");
  }
});

const AddSubCategory = asyncHandler(async (req, res) => {
  const varition = req.body;
  const updateCategory = req.body.category;
  console.log(req.body);
  const update = await db
    .get()
    .collection(collection.CATEGORY_COLLECTION)
    .update({ Category: updateCategory }, { $push: { variation: varition } });

  if (update) {
    res.status(200).json("Success");
  } else {
    res.status(401).json("Somthing Went Wrong");
  }
});
const Addproducts = asyncHandler(async (req, res) => {
  const product = req.body;
  const oldProducts = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find()
    .sort({ _id: -1 })
    .limit(1);
  if (oldProducts[0]?.id) {
    const PR = oldProducts[0].id;
    const inc = parseInt(PR) + 1;
    product.id = inc;
  } else {
    product.id = 100;
  }
  const addproducts = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .insertOne(product);
  if (addproducts) {
    res.status(200).json("Success");
  } else {
    res.status(500).json("Somthing Went Wrong");
  }
});
const viewAllProducts = asyncHandler(async (req, res) => {
  const products = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find({ hidden: false,stockManagement:true })
    .toArray();
  if (products) {
    res.status(200).json(products);
  } else {
    res.status(400).json("Somthing Went Wrong");
  }
});
const ViewCategoryProducts = asyncHandler(async (req, res) => {
  const Category = req.params.id;
  const product = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find({ category: Category })
    .toArray();
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(201).json("No records");
  }
});
const ImageUploading = asyncHandler(async (req, res) => {
  let images = [];
  if (req.files.file && req.files.file.length > 0) {
    for (let i = 0; i < req.files.file.length; i++) {
      console.log(req.files.file[i]);
      uploadS3(req.files.file[i].data)
        .then((result) => {
          const obj = {
            image: result.Location,
            key: result.Key,
          };
          images.push(obj);
          if (images.length == req.files.file.length) {
            res.status(200).json(images);
          }
        })
        .catch((error) => {
          res.status(400).json("Something went wrong");
        });
    }
  } else {
    uploadS3(req.files.file.data)
      .then((result) => {
        const obj = {
          image: result.Location,
          key: result.Key,
        };
        res.status(200).json(obj);
      })
      .catch((error) => {
        res.status(400).json("Something went wrong");
      });
  }
  // uploadS3(req.files.file.data)
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  // console.log(req.files);
  // console.log("kckkc");
  // const uploadParams = {
  //   Bucket: "moffa",
  //   Key: req.files.file.name,
  //   Body: Buffer.from(req.files.file.data),
  //   ContentType: req.files.file.mimetype,
  // };
  // s3.upload(uploadParams, function (err, data) {
  //   err && console.log("Error", err);
  //   data && console.log("Upload Success", data.Location);
  // });
});
const ViewStockProducts = asyncHandler(async (req, res) => {
  const stock = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find()
    .toArray();
  if (stock) {
    res.status(200).json(stock);
  } else {
    res.status(404).json("No records");
  }
});
const UpdateProduct = asyncHandler(async (req, res) => {
  const id = req.body.id;
  const variants = req.body.variants;
  const updated = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .updateOne({ _id: ObjectId(id) }, { $set: { variants: variants } });
  if (updated) {
    res.status(200).json("Updated");
  } else {
    res.status(404).json("something went wrong");
  }
});

const DeleteProduct = asyncHandler(async (req, res) => {
  const id = req.body.id;
  const hidden = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .updateOne({ _id: ObjectId(id) }, { $set: { hidden: true } });
  if (hidden) {
    res.status(200).json("Success");
  } else {
    res.status(404).json("Something Went Wrong");
  }
});
const viewStockManagementProducts = asyncHandler(async (req, res) => {
  const product = await db
    .get()
    .collection(collection.PRODUCT_COLLECTION)
    .find({ stockManagement: false })
    .toArray();
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(400).json("No records");
  }
});
module.exports = {
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
  viewAllProducts,
  ViewCategoryProducts,
  ImageUploading,
  ViewStockProducts,
  UpdateProduct,
  DeleteProduct,
  viewStockManagementProducts
};
