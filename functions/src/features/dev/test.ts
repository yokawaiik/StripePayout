import { onRequest } from "firebase-functions/v2/https";

import * as logger from "firebase-functions/logger";

import * as admin from "firebase-admin";
admin.initializeApp();

export const test = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });

  response.send("Hello from Firebase!");
});
