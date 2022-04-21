const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const coupon = require("../models/coupon");
const stripe = require("stripe")('sk_test_51KgF5cDO7QLTEbiLYMICGZKBID3IwUPoPaFLEIA85tiL0hsxp2VIn9y5Jm0968kmcMwYooSBd8AkpB32jbECEWRx00gO22149X');


exports.createPaymentIntent = async (req, res) => {
  // console.log(req.body);
  const { couponApplied } = req.body;

  // 1 find user
  const user = await User.findOne({ email: req.user.email }).exec();
  // console.log("USER",user._id );
  const { cartTotal, totalAfterDiscount } = await Cart.findOne({orderedBy: user._id})
  .populate('products.product','_id title price totalAfterDiscount')
  .exec();
  // console.log("CART TOTAL", cartTotal, "AFTER DIS%", totalAfterDiscount);

  let finalAmount = 0;

  if (couponApplied && totalAfterDiscount) {
    finalAmount = totalAfterDiscount * 100;
  } else {
    finalAmount = cartTotal * 100;
  }

  // create payment intent with order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmount,
    currency: "brl",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    cartTotal,
    totalAfterDiscount,
    payable: finalAmount,
  });
};
