import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";

import * as logger from "firebase-functions/logger";
import Stripe from "stripe";

export const retrieveUserPayoutStripeAccount = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  id: string
): Promise<Stripe.Account> => {
  try {
    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    const userPayoutAccount = await stripe.accounts.retrieve(id);
    return userPayoutAccount;
  } catch (error: any) {
    if (
      error.rawType === "invalid_request_error" &&
      error.code === "account_invalid"
    ) {
      throw new IternalFeatureException(
        "Stripe connected account not found.",
        IternalFeatureExceptionType.UserPayoutStripeAccountNotFound
      );
    }

    logger.error({
      message: "Unexpected error retrieving user payout stripe account.",
      error: error,
    });

    throw error;
  }
};
