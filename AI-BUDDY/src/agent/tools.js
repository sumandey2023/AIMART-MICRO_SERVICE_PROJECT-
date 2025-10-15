// const { tool } = require("@langchain/core/tools");
// const { z } = require("zod");
// const axios = require("axios");

// const searchProduct = tool(
//   // Accept (input, ctx) because the tool runner may provide a run context as second arg.
//   async (input, ctx) => {
//     console.log("searchProduct called with data:", { input, ctx });

//     // input can be a string or an object like { input: 'red shirt' } or { query: '...' }
//     const queryStr =
//       typeof input === "string"
//         ? input
//         : input?.input ?? input?.query ?? input?.q ?? JSON.stringify(input);

//     // token may be passed on the input or inside the run context metadata
//     const token = input?.token ?? ctx?.metadata?.token;

//     const response = await axios.get(
//       `http://localhost:3001/api/products?q=${encodeURIComponent(queryStr)}`,
//       {
//         headers: token
//           ? {
//               Authorization: `Bearer ${token}`,
//             }
//           : {},
//       }
//     );

//     return JSON.stringify(response.data);
//   },
//   {
//     name: "searchProduct",
//     description: "Search for products based on a query",
//     inputSchema: z.object({
//       query: z.string().describe("The search query for products"),
//     }),
//   }
// );

// const addProductToCart = tool(
//   // Accept (input, ctx) to reliably pick token from either place
//   async (input, ctx) => {
//     // input may be an object with productId and qty, or nested differently depending on caller
//     const productId =
//       input?.productId ?? input?.id ?? input?.productId?.toString();
//     const qty = input?.qty ?? input?.quantity ?? 1;
//     const token = input?.token ?? ctx?.metadata?.token;

//     const response = await axios.post(
//       `http://localhost:3002/api/cart/items`,
//       {
//         productId,
//         qty,
//       },
//       {
//         headers: token
//           ? {
//               Authorization: `Bearer ${token}`,
//             }
//           : {},
//       }
//     );

//     return `Added product with id ${productId} (qty: ${qty}) to cart`;
//   },
//   {
//     name: "addProductToCart",
//     description: "Add a product to the shopping cart",
//     schema: z.object({
//       productId: z
//         .string()
//         .describe("The id of the product to add to the cart"),
//       qty: z
//         .number()
//         .describe("The quantity of the product to add to the cart")
//         .default(1),
//     }),
//   }
// );

// module.exports = { searchProduct, addProductToCart };

const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const searchProduct = tool(
  async ({ query, token }) => {
    console.log("searchProduct called with data:", { query, token });

    const response = await axios.get(
      `http://localhost:3001/api/products?q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return JSON.stringify(response.data);
  },
  {
    name: "searchProduct",
    description: "Search for products based on a query",
    schema: z.object({
      query: z.string().describe("The search query for products"),
    }),
  }
);

const addProductToCart = tool(
  async ({ productId, qty = 1, token }) => {
    const response = await axios.post(
      `http://localhost:3002/api/cart/items`,
      {
        productId,
        qty,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return `Added product with id ${productId} (qty: ${qty}) to cart`;
  },
  {
    name: "addProductToCart",
    description:
      "Add a product to the shopping cart no need of user confirmation if you found a product add that to the cart directly. if there more than one product found add the first one",
    schema: z.object({
      productId: z
        .string()
        .describe("The id of the product to add to the cart"),
      qty: z
        .number()
        .describe("The quantity of the product to add to the cart")
        .default(1),
    }),
  }
);

module.exports = { searchProduct, addProductToCart };
