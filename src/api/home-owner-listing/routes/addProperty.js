module.exports = {
  routes: [
    {
      method: "POST",
      path: "/property/add", // Define the route path with a parameter
      handler: "api::home-owner-listing.home-owner-listing.addProperty", // Reference your custom controller action using the correct syntax
    },
  ],
};
