const assert = require("node:assert/strict");
const test = require("node:test");
const { isDropboxUrl } = require("../src/utils/dropboxImage.js");

test("accepts only public Dropbox HTTPS links as image sources", () => {
  assert.equal(isDropboxUrl("https://www.dropbox.com/scl/fi/example/image.jpg?dl=0"), true);
  assert.equal(isDropboxUrl("https://example.com/image.jpg"), false);
  assert.equal(isDropboxUrl("http://www.dropbox.com/image.jpg"), false);
});
