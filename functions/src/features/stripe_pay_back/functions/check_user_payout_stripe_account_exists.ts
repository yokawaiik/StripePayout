import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { validUserToken } from "../../../utils/auth/valid_user_token";
import { decodeUserToken } from "../../../utils/auth/decode_user_token";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";

import { stripeIntegrationConfig } from "../stripe_configuration/stripe_configuration";
import { STRIPE_API_KEY } from "../../../constants/constants";
import { checkUserPayoutAccountExists } from "../utils/check_user_payout_account_exists";
import { getUserPayoutAccountByUID } from "../utils/get_user_payout_account_by_uid";
import { retrieveUserPayoutStripeAccount } from "../utils/retrieve_user_payout_stripe_account";

/**
 * Create a customer account link
 */
export const checkUserPayoutStripeAccountExists = onRequest(
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
        message: "User requested to check user payout stripe account exists.",
        request: request,
      });

      // ? check if user exists
      const userAccountExists = await checkUserPayoutAccountExists(
        stripeIntegrationConfig,
        decodedUserToken!
      );

      if (!userAccountExists) {
        response.status(200).send({
          message: "Account not found",
        });
        return;
      }

      const userPayoutAccount = await getUserPayoutAccountByUID(
        stripeIntegrationConfig,
        decodedUserToken!.uid
      );

      const retrievedStripeAccount = await retrieveUserPayoutStripeAccount(
        stripeIntegrationConfig,
        userPayoutAccount.id
      );

      if (retrievedStripeAccount.payouts_enabled === false) {
        response.status(200).send({
          result: false,
          message:
            "Account is exists but user has to finish register his payout account.",
        });
        return;
      }

      response
        .status(200)
        .send({ result: true, message: "User connected account exists." });
    } catch (error) {
      let message = "Unexpected error";
      let code = 500;

      if (error instanceof IternalFeatureException) {
        message = error.type.toString();

        switch (error.type) {
          case IternalFeatureExceptionType.UserPayoutStripeAccountNotFound:
            logger.warn({
              message: message,
            });
            response.status(200).send({
              result: false,
              message: message,
            });
            return;

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
