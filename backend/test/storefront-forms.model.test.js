const assert = require("node:assert/strict");
const test = require("node:test");
const WebsiteContact = require("../src/model/website-contact.model.js");
const NewsletterSubscriber = require("../src/model/newsletterSubscriber.model.js");

test("storefront contact and newsletter models use the website collections", async () => {
  const contact = new WebsiteContact({
    name: "Jane Doe",
    email: "jane@example.com",
    mobileNumber: "9876543210",
    subject: "Product question",
    message: "Please share the available colour options.",
  });

  await contact.validate();
  assert.equal(WebsiteContact.collection.name, "contacts");
  assert.equal(NewsletterSubscriber.collection.name, "newsletter_subscribers");
});
