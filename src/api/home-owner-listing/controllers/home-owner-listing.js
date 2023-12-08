"use strict";

/**
 * home-owner-listing controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::home-owner-listing.home-owner-listing",
  () => ({
    async addProperty(ctx, next) {
      ctx.send({ msg: "Created" });
    },
  })
);
