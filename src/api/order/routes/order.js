// 'use strict';

// /**
//  * order router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::order.order', {

// });

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/order/stripe-webhook", // Define the route path
      handler: "order.createOrderFromStripe", // Reference your custom controller action
      config: {
        policies: [], // Add any policies you need to secure the endpoint
      },
    },
  ],
};
