const XLSX = require("xlsx");

const MAX_DOWNLOAD_LIMIT = 10000;

/**
 * Normalises field names from DB (userType, productType) to the display
 * names the frontend tables expect (UserType, ProductEnquire), and
 * stringifies the productType array so it renders in a single cell.
 */
function formatProductType(lead) {
  const { productType, userType, ...rest } = lead;

  const rawArray = productType || rest.ProductEnquire;
  const productEnquireStr = Array.isArray(rawArray) && rawArray.length > 0
    ? rawArray.join(", ")
    : (typeof rawArray === "string" ? rawArray : "");

  return {
    ...rest,
    UserType: rest.UserType || userType || "",
    ProductEnquire: productEnquireStr,
  };
}

/**
 * Fetches a paginated result set from the external website API.
 */
async function fetchFromExternalAPI(apiPath, page, limit) {
  const queryParams = new URLSearchParams({ page, limit });
  const response = await fetch(
    `${process.env.API_ENDPOINT}${apiPath}?${queryParams}`,
    {
      method: "GET",
      headers: {
        "x-admin-secret": process.env.ADMIN_SECRET,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`External API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Serialises an array of plain objects to an xlsx buffer and
 * sends it as a file-download response.
 */
function sendExcelDownload(res, data, filename = "Leads.xlsx") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buf);
}

/**
 * Parses page/limit from req.query with safe bounds.
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit) || 10), MAX_DOWNLOAD_LIMIT);
  return { page, limit };
}

module.exports = {
  MAX_DOWNLOAD_LIMIT,
  formatProductType,
  fetchFromExternalAPI,
  sendExcelDownload,
  parsePagination,
};
