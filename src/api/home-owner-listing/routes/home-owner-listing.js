/**
 * home-owner-listing router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::home-owner-listing.home-owner-listing");

// module.exports = {
//   routes: [
//     {
//       method: "GET",
//       path: "/property/:uuid", // Define the route path with a parameter
//       handler: "home-owner-listing.findByUUID", // Reference your custom controller action
//       config: {
//         policies: [], // Add any policies you need to secure the endpoint
//       },
//     },
//   ],
// };
