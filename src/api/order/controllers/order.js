"use strict";
const axios = require("axios");
/**
 * order controller
 */
// const stripe = require("stripe")(
//   process.env.STRAPI_ADMIN_LIVE_STRIPE_SECRET_KEY
// );
const { v4: uuidv4 } = require("uuid");
const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(
  "sk_test_51MAFFNCOS8EmKqSJGpqAr7jCggLOEC8kNbtWSSOd5TwLY4RlUG6uPrtsRvWvvW6o7ypTUH5lakjlobGEItDont2G00vGRK62Dt"
); // Replace with your Stripe secret key

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async createOrderFromStripe(ctx) {
    try {
      const url =
        "https://webhook.site/token/9feca296-d17a-4fea-a055-26c617d0b108/requests";

      // Define custom headers
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "Content-Length,Content-Range",
      };

      const {
        sessionId,
        email,
        firstLastName,
        password,
        street,
        postal,
        country,
        region,
        phone,
        city,
        birthDate,
        location,
        selectedLocations,
        description,
        selectUser,
      } = ctx.request.body;

      // Create a data object containing the extracted data

      const urlRegister = process.env.API_URL + "/api/auth/local/register";
      const token =
        "d6b2ad7cb94825a226197fd9ea0ee714921da024ceb6a146a75a92ab6d2bddc77e70d547b6bd26933972fa215e40cb0e594b0893ec2bd5d27be928fb929cf8ef9fa188b6c506542c1a40db199784580efd87fcc0b991a23bb05dbf62376e8d4b53ce7a292c6e37043d1bedb3aa478061abdfc2606449fc30e9ed872b4b10f632";
      // Use a Promise to delay the API call
      const delayedApiResponse = () =>
        new Promise((resolve) => {
          setTimeout(async () => {
            const response = await axios.get(url, { headers });

            // Process the response data as needed
            const responseData = response.data.data;
            const uuIds = response.data.data.map((id) => {
              return id.content.slice(7, id.content.indexOf(`",`));
            });
            const filteredUuid = response.data.data.filter((id) => {
              return (
                id.content.slice(7, id.content.indexOf(`",`)) === sessionId
              );
            });

            // Initialize variables to store extracted values
            let sessionEmail, name, subName, uuid;

            if (filteredUuid[0]) {
              const content = filteredUuid[0].content;

              // Find the index of the email field
              const emailIndex = content.indexOf('"email":"');
              if (emailIndex !== -1) {
                const emailStartIndex = emailIndex + '"email":"'.length;
                const emailEndIndex = content.indexOf('"', emailStartIndex);
                sessionEmail = content.substring(
                  emailStartIndex,
                  emailEndIndex
                );
              }

              // Find the index of the name field
              const nameIndex = content.indexOf('"name":"');
              if (nameIndex !== -1) {
                const nameStartIndex = nameIndex + '"name":"'.length;
                const nameEndIndex = content.indexOf('"', nameStartIndex);
                name = content.substring(nameStartIndex, nameEndIndex);
              }

              // Find the index of the productName field
              const productNameIndex = content.indexOf('"productName":"');
              if (productNameIndex !== -1) {
                const productNameStartIndex =
                  productNameIndex + '"productName":"'.length;
                const productNameEndIndex = content.indexOf(
                  '"',
                  productNameStartIndex
                );
                subName = content.substring(
                  productNameStartIndex,
                  productNameEndIndex
                );
              }

              // Find the index of the id field
              const idIndex = content.indexOf('"id":"');
              if (idIndex !== -1) {
                const idStartIndex = idIndex + '"id":"'.length;
                const idEndIndex = content.indexOf('"', idStartIndex);
                uuid = content.substring(idStartIndex, idEndIndex);
              }
            }

            const sessionIdExists = uuIds.includes(sessionId);
            if (sessionIdExists) {
              const data = {
                email: sessionEmail,
                name,
                subName,
                uuid,
              };
              //   Create a new order in Strapi
              const entry = await strapi.entityService.create(
                "api::order.order",
                {
                  data,
                }
              );

              const headersRegister = {
                Authorization: `bearer ${token}`,
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "Content-Length,Content-Range",
              };

              axios
                .post(
                  urlRegister,
                  {
                    email: sessionEmail,
                    firstLastName: firstLastName?.trim(),
                    password: password?.trim(),
                    street: street?.trim(),
                    postal: postal?.trim(),
                    country: country?.trim(),
                    region: region?.trim(),
                    phone: phone?.trim(),
                    city: city?.trim(),
                    birthDate: birthDate?.trim(),
                    location: location?.trim(),
                    selectedLocations: selectedLocations,
                    confirmed: true,
                    blocked: false,
                    username: sessionEmail,
                    description: description?.trim(),
                    role: "Public", //OVDE MORA DA SE VIDI STA DA SE RADI, JER ROLE NE MOZE DA SE PODESI, AUTHENTICATED JE PO DEFAULTU, ZBOG SIGURNOSTI TAKO RADI STRAPI, ROLE BI TREBAO DA SE PODESI PO TIPU selectUsera
                    userId: uuidv4(),
                    selectUser:
                      selectUser === "Care Provider"
                        ? "Care Provider"
                        : "Estate Agent / Landlord",
                  },
                  { headers: headersRegister }
                )
                .then((response) => {
                  // Handle the response data here

                  resolve({
                    data: response.data,
                  });
                })
                .catch((error) => {
                  // Handle errors here
                  resolve({
                    error,
                  });
                  console.error("Error:", error);
                });
              resolve({
                success: true,
              });
            } else if (!sessionIdExists) {
              const data = {
                email,
                firstLastName,
                password,
                street,
                postal,
                country,
                region,
                phone,
                city,
                birthDate,
                location,
                selectedLocations: selectedLocations,
                username: email,
                selectUser:
                  selectUser === "Care Provider"
                    ? "Care Provider"
                    : "Estate Agent / Landlord",
              };
              const draft = await strapi.entityService.create(
                "api::draft-user.draft-user",
                {
                  data,
                }
              );
            }
            // Return the created order
            resolve({
              success: false,
            });
          }, 2000);
        });

      // Wait for the delayed API response
      const response = await delayedApiResponse();

      // Send the response back to the client
      ctx.send(response);
    } catch (error) {
      // Handle errors here
      console.error(error);

      // Send an error response to the client
      ctx.status = 500; // Set an appropriate status code
      ctx.send({
        success: false,
        error: "An error occurred.",
        // const endpointSecret =
        //   "whsec_20690d9ac2e4263574694c8b5f4673319c6271fdb11a2bdbe0b7a515ec8c8f22";
        // // const sig = ctx.request.headers["stripe-signature"];
        // const body = ctx.request.body;
        // try {
        //   const {
        //     email,
        //     firstLastName,
        //     password,
        //     street,
        //     postal,
        //     country,
        //     region,
        //     phone,
        //     city,
        //     birthDate,
        //     agreeTerms,
        //     location,
        //     selectedLocations,
        //   } = body;

        //   // Create a data object containing the extracted data
        //   const userData = {
        //     email,
        //     firstLastName,
        //     password,
        //     street,
        //     postal,
        //     country,
        //     region,
        //     phone,
        //     city,
        //     birthDate,
        //     agreeTerms,
        //     location,
        //     selectedLocations,
        //   };

        // const sig = ctx.request.headers["stripe-signature"];

        // let event;

        //     event = stripe.webhooks.constructEvent(
        //       ctx.request.body,
        //       sig,
        //       endpointSecret
        //     );
        //   } catch (err) {
        //     ctx.response.status = 400;

        //     ctx.send({
        //       success: sig,
        //       msg: `Webhook Error: ${err.message}`,
        //     });
        //     return;
        //   }

        //   // Handle the event
        //   switch (event.type) {
        //     case "payment_intent.succeeded":
        //       const paymentIntentSucceeded = event.data.object;
        //       // Then define and call a function to handle the event payment_intent.succeeded
        //       ctx.send({
        //         success: body,
        //       });
        //       break;
        //     // ... handle other event types
        //     default:
        //       console.log(`Unhandled event type ${event.type}`);
        //   }
        //   ctx.send({
        //     success: body,
        //   });
        //   // Return a 200 response to acknowledge receipt of the event
        //   ctx.response.status = 200;
        // } catch (error) {
        //   // Handle errors and return an error response
        //   console.error(error);

        //   // Instead of shutting down the server, send an error response to the client
        //   ctx.status = 500; // Set an appropriate status code
        //   ctx.send({
        //     success: false,
        //     error: "An error occurred.",
        //     ctx: ctx.request.body,
        //   });
      });
    }
  },
}));
