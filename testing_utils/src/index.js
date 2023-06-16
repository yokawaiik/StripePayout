"use strict";

import dotenv from "dotenv";
dotenv.config();

import { createToken } from "./utils/create_token.js";

const main = async function () {
  try {
    if (process.env.EMAIL === undefined || process.env.PASSWORD === undefined) {
      throw "EMAIL or PASSWORD not found.";
    }
    const token = await createToken(process.env.EMAIL, process.env.PASSWORD);
    console.log(`Authorization: ${token}`);
  } catch (error) {
    console.log("Error script.");
    console.log(`Error: ${error}`);
  }
};

main();
