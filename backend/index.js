const express = require("express");
require("./db/config");
const cors = require("cors");
const User = require("./db/users");
const Product = require("./db/products");
const app = express();

app.use(express.json());
app.use(cors());

const jwt = require("jsonwebtoken");
const jwtkey = "e-comm";

app.post("/signup", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({
        result: "Something went wrong, please try after some time",
      });
    }
    result = result.toObject();
    delete result.password;
    res.send({result, auth: token });
  });
  
//   res.send(result);
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select(" -password");
    if (user) {
      jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({
            result: "Something went wrong, please try after some time",
          });
        }
        res.send({user, auth: token });
      });
      
    } else {
      res.send({ result: "No user found" });
    }
  } else {
    res.send({ result: "No user found" });
  }
});

//Add product api
app.post("/products", verifyToken, async (req, res) => {
  let user = new Product(req.body);
  let result = await user.save();
  res.send(result);
});

//product list api
app.get("/list", verifyToken, async (req, res) => {
  let product_list = await Product.find();
  if (product_list.length > 0) {
    res.send(product_list);
  } else {
    res.send({ result: "No product found" });
  }
});

//product update api
app.put("/products/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );

  res.send(result);
});

//get product details
app.get("/product_details/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No product found" });
  }
});

//search api
app.get("/search_product/:key", verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { pname: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

//delete api
app.delete("/delete/:id", verifyToken, async (req, res) => {
  let delete_prod = await Product.deleteOne({ _id: req.params.id });
  res.send(delete_prod);
});

function verifyToken(req, res, next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        jwt.verify(token, jwtkey, (err, valid) => {
            if(err){
                res.status(401).send({ result : "Please provide valid token"})
            }else{
                next();
            }
        })

    }else{
        res.status(403).send({result:"Please add token with header"});
    }
}

app.listen(5000);
