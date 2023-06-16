import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { validUserToken } from "../../../utils/auth/valid_user_token";
import { decodeUserToken } from "../../../utils/auth/decode_user_token";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";

import { createUserPayoutAccountLinkHandler } from "../utils/create_user_payout_account_link_handler";
import { stripeIntegrationConfig } from "../stripe_configuration/stripe_configuration";
import { STRIPE_API_KEY } from "../../../constants/constants";

/**
 * Create a customer account link
 */
export const createUserPayoutAccountLink = onRequest(
  { secrets: [STRIPE_API_KEY] },
  async (request, response) => {
    try {
      const decodedUserToken = await decodeUserToken(request);

      if (decodedUserToken === null) {
        logger.info({
          message: "Token not found.",
          request: request,
        });
        response.status(400).json({
          error: "Not Authorized",
        });
        return;
      }
      // boiler plate verifiction
      const isValidToken: boolean = await validUserToken(decodedUserToken);
      if (!isValidToken) {
        logger.info({
          message: "Token not valid.",
          request: request,
        });
        response.status(400).json({
          error: "Not Authorized",
        });
        return;
      }
      //

      logger.info({
        message: "User requested to create a customer account link.",
        request: request,
      });

      const createdAccountLink = await createUserPayoutAccountLinkHandler(
        stripeIntegrationConfig,
        decodedUserToken!.uid
      );

      response.status(200).send({ accountLink: createdAccountLink });
    } catch (error) {
      let message = "Unexpected error";
      let code = 500;

      if (error instanceof IternalFeatureException) {
        message = error.type.toString();

        switch (error.type) {
          case IternalFeatureExceptionType.WriteDatabaseError:
          case IternalFeatureExceptionType.Unexpected:
            code = 500;
            break;
          default:
            code = 400;
        }
      }

      logger.error({
        message: message,
        request: request,
        error: error,
      });

      response.status(code).send({ error: message });
    }
  }
);
