import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { stripeIntegrationConfig } from "../stripe_configuration/stripe_configuration";
import { validUserToken } from "../../../utils/auth/valid_user_token";
import { decodeUserToken } from "../../../utils/auth/decode_user_token";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { STRIPE_API_KEY } from "../../../constants/constants";
import { checkUserPayoutAccountExists } from "../utils/check_user_payout_account_exists";
import { createUserPayoutStripeAccount } from "../utils/create_user_payout_stripe_account";
import { createUserPayoutAccountDocument } from "../utils/create_user_payout_account_document";

export const createUserPayoutAccount = onRequest(
  { secrets: [STRIPE_API_KEY] },
  async (request, response) => {
    try {
      const decodedUserToken = await decodeUserToken(request);
      if (decodedUserToken === null) {
        logger.info({
          message: "Request without user token.",
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
          message: "Token is not valid.",
          request: request,
        });
        response.status(400).json({
          error: "Not Authorized",
        });
        return;
      }
      //

      logger.info({
        message: "User requested to create a customer account.",
        request: request,
      });

      // ? check if user exists
      const stripeUserAccountExists = await checkUserPayoutAccountExists(
        stripeIntegrationConfig,
        decodedUserToken!
      );
      if (stripeUserAccountExists) {
        response.status(400).send({
          error: "Account creating error",
          message: "Account already exists",
        });
        return;
      }

      const createdUserPayoutAccount = await createUserPayoutStripeAccount(
        stripeIntegrationConfig,
        decodedUserToken!
      );

      await createUserPayoutAccountDocument(
        stripeIntegrationConfig,
        decodedUserToken!,
        createdUserPayoutAccount!
      );

      response.status(200).send({
        message: "User payout account created successfully.",
      });
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
