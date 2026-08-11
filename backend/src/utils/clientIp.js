const cleanIp = (value = "") => {
  if (!value) return "";
  return String(value).trim().replace(/^::ffff:/, "");
};

const firstForwardedIp = (value = "") => {
  if (!value) return "";
  return cleanIp(String(value).split(",")[0]);
};

const getHeader = (req, name) => {
  if (!req) return "";
  if (typeof req.get === "function") return req.get(name) || "";
  return req.headers?.[name.toLowerCase()] || "";
};

const getClientIp = (req) => {
  const forwardedFor = getHeader(req, "x-forwarded-for");
  const candidates = [
    getHeader(req, "cf-connecting-ip"),
    getHeader(req, "x-real-ip"),
    firstForwardedIp(forwardedFor),
    req?.ip,
    req?.socket?.remoteAddress,
  ];

  return {
    realIpAddress: cleanIp(candidates.find(Boolean) || ""),
    forwardedFor: forwardedFor || "",
    ipAddress: cleanIp(req?.ip || ""),
  };
};

module.exports = {
  getClientIp,
};
