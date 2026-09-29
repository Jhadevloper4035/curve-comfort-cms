const assert = require("node:assert/strict");
const test = require("node:test");
const XLSX = require("xlsx");
const { parseProductCsv, parseProductFile } = require("../src/controller/products.controller.js");

test("product CSV parser normalizes column headings", () => {
  const [row] = parseProductCsv("Title,Description,Base Price,Category,Images\nCloud Sofa,A comfortable sofa,19999,Sofas,https://example.com/sofa.jpg");

  assert.deepEqual(row, {
    title: "Cloud Sofa",
    description: "A comfortable sofa",
    baseprice: "19999",
    category: "Sofas",
    images: "https://example.com/sofa.jpg",
  });
});

test("product CSV parser rejects an empty file", () => {
  assert.throws(() => parseProductCsv("title,description"), /no product rows/);
});

test("product Excel parser accepts the downloadable bulk-update format", () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ "Product ID": "123", Title: "Cloud Sofa" }]), "Products");
  const file = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

  assert.deepEqual(parseProductFile({ file }), [{ productid: "123", title: "Cloud Sofa" }]);
});
