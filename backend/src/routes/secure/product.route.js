const express = require("express");
const { getProducts, downloadProducts, createProduct, updateProduct, deleteProduct } = require("../../controller/products.controller.js");

const router = express.Router();

router.get("/", getProducts);
router.get("/download", downloadProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
