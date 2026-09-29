const express = require("express");
const { getProducts, downloadProducts, downloadBulkUpdateTemplate, createProduct, importProducts, updateProduct, deleteProduct } = require("../../controller/products.controller.js");

const router = express.Router();

router.get("/", getProducts);
router.get("/download", downloadProducts);
router.get("/bulk-template", downloadBulkUpdateTemplate);
router.post("/", createProduct);
router.post("/bulk-import", importProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
