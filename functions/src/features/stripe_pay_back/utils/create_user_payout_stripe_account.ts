import { DecodedIdToken } from "firebase-admin/auth";
import Stripe from "stripe";
import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import * as logger from "firebase-functions/logger";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { CURRENCY } from "../../../constants/constants";

export const createUserPayoutStripeAccount = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  decodedUserToken: DecodedIdToken
): Promise<Stripe.Account | null> => {
  try {
    logger.info({
      message: `Creating customer account with for user with uid ${decodedUserToken.uid}`,
    });

    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    // const createdCustomerAccount = await stripe.customers.create({
    //   email: decodedUserToken.email,
    //   name: decodedUserToken.uid,
    //   metadata: {
    //     uid: decodedUserToken.uid,
    //   },
    // });
    const createdAccount = await stripe.accounts.create({
      type: "standard",
      country: "US",
      email: decodedUserToken.email,
      business_type: "individual",
      metadata: {
        uid: decodedUserToken.uid,
      },
      default_currency: CURRENCY,
    });

    return createdAccount;
  } catch (error) {
    logger.error({
      message: "Creating customer account ended with error.",
      error: error,
    });
    throw new IternalFeatureException(
      "Create customer account ended with error.",
      IternalFeatureExceptionType.AccountNotCreated
    );
  }
};
