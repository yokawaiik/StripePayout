import Stripe from "stripe";
import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import * as logger from "firebase-functions/logger";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { getUserPayoutAccountByUID } from "./get_user_payout_account_by_uid";
import {
  DEEP_LINK_REFRESH_URL,
  DEEP_LINK_RETURN_URL,
} from "../../../constants/constants";

export const createUserPayoutAccountLinkHandler = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  uid: string
): Promise<Stripe.AccountLink> => {
  try {
    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    const userAccount = await getUserPayoutAccountByUID(
      stripeIntegrationConfig,
      uid
    );

    const createdAccountLink = await stripe.accountLinks.create({
      account: userAccount.id,
      return_url: DEEP_LINK_RETURN_URL,
      refresh_url: DEEP_LINK_REFRESH_URL,
      type: "account_onboarding",
    });

    return createdAccountLink;
  } catch (error) {
    if (error instanceof IternalFeatureException) {
      throw error;
    }

    logger.error({
      message: "Create customer account link not created.",
      error: error,
    });
    throw new IternalFeatureException(
      "Create customer account link with error.",
      IternalFeatureExceptionType.LinkNotCreated
    );
  }
};
