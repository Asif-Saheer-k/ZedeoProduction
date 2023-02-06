const asyncHandler = require("express-async-handler");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const collection = require("../config/collection");
const generateToken = require("../utils/jwtToken");
const verification = require("../middlewares/twiliovVerification");

//userLogin function
const userLogin = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    try {
      const Findemail = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: email });
      console.log(Findemail);
      if (Findemail) {
        bcrypt.compare(password, Findemail.password).then(async (status) => {
          if (status) {
            const name = Findemail.name;
            const email = Findemail.email;
            const phone = Findemail.phone;
            const CUST_ID = Findemail._id;
            const token = generateToken(Findemail._id);
            res.status(200).json({ name, email, phone, CUST_ID, token });
          } else {
            res.status(401).json("Incorrect Password");
          }
        });
      } else {
        res.status(401).json("Invalid Email Address");
      }
    } catch (error) {
      res.status(401).json("Invalid Email Address");
    }
  } else {
    res.status(401).json("Please Provide Credentials");
  }
});

//user registration function
const userRegistration = asyncHandler(async (req, res) => {
  const CUST_ID = 1;
  const { name, email, phone, password } = req.body;
  console.log(req.body);

  const checkPhone = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({ phone: phone });
  if (checkPhone) {
    res.status(401).json("Already registred number");
  } else {
    const code = await verification.sendOtp(phone);
    if (code) {
      res.status(200).json({ name, email, phone, password });
    } else {
      res.status(500).json("Somthing went wrong");
    }
  }
});

//user Phone verification function
const phoneVerification = asyncHandler(async (req, res) => {
  const { name, email, phone, CUST_ID, password, otp } = req.body;
  const userData = {
    name,
    email,
    phone,
    CUST_ID,
    password,
    otp,
  };

  let UserId = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .find()
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
  let ID;
  if (UserId[0]) {
    ID = UserId[0]?.CUST_ID + 1;
  } else {
    ID = 10000000;
  }
  const OTP = otp;
  // req.session.userDeatails.CUST_ID=ID

  const phoneNumber = userData.phone;
  userData.CUST_ID = ID;
  userData.password = await bcrypt.hash(userData.password, 10);
  const code = await verification.CheckOtp(phoneNumber, OTP);
  // check valid true or false
  if (code.valid) {
    const User = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .insertOne(userData);
    if (User) {
      res.status(200).json("successfuly reagisted");
    } else {
      res.status(500).json("Somthing went wrong");
    }
  } else {
    res.status(401).json("Please Verify OTP");
  }
});
const OTPLOGIN = asyncHandler(async (req, res) => {
  const phone = req.body.phone;
  const cheackPhone = await db
    .get()
    .collection(collection.USER_COLLECTION)
    .findOne({ phone: phone });
  if (cheackPhone) {
    req.session.OTPLOGIN = cheackPhone;
    const code = await verification.sendOtp(phone);
    if (code) {
      res.status(200).json(cheackPhone);
    } else {
      res.status(500).json("Somthing went wrong");
    }
  } else {
    res.status(401).json("Invalid phone number");
  }
});
const verifyOTP = asyncHandler(async (req, res) => {
  const { name, phone, email, password, otp, CUST_ID } = req.body;
  const userDeatails = {
    name,
    phone,
    password,
    email,
    otp,
    CUST_ID,
  };
  const code = await verification.CheckOtp(phone, otp);
  if (code.valid) {
    const name = userDeatails.name;
    const email = userDeatails.email;
    const phone = userDeatails.phone;
    const CUST_ID = userDeatails.CUST_ID;
    const token = generateToken(userDeatails.CUST_ID);
    res.status(200).json({ name, email, phone, CUST_ID, token });
  } else {
    res.status(401).json("Invalid OTP");
  }
});
const GetUserDeatilse = asyncHandler(async (req, res) => {
  const userID = req.body.CUST_ID;
  try {
    const userDeatails = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ CUST_ID: parseInt(userID) });
    res.status(200).json(userDeatails);
  } catch (error) {
    res.status(500).json("Somthing Went Wrong");
  }
});
const UpdateUserCridentails = asyncHandler(async (req, res) => {
  const { email, name, CUST_ID } = req.body;
  try {
    await db
      .get()
      .collection(collection.USER_COLLECTION)
      .updateOne({ CUST_ID: CUST_ID }, { $set: { name: name, email: email } });
    res.status(200).json("Updated");
  } catch (error) {
    res.status(500).json("Somthing Wernt Wrong");
  }
});
const ChangePassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword, CUST_ID } = req.body;
  try {
    const findUser = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ CUST_ID: CUST_ID });
    bcrypt.compare(oldPassword, findUser.password).then(async (status) => {
      if (status) {
        await db
          .get()
          .collection(collection.USER_COLLECTION)
          .updateOne({ CUST_ID: CUST_ID }, { $set: { password: newPassword } });
        res.status(200).json("Updated");
      } else {
        res.status(401).json("Invalid Password");
      }
    });
  } catch (error) {
    res.status(500).json("Somthing went wrong");
  }
});
module.exports = {
  userLogin,
  userRegistration,
  phoneVerification,
  OTPLOGIN,
  verifyOTP,
  GetUserDeatilse,
  UpdateUserCridentails,
  ChangePassword,
};
