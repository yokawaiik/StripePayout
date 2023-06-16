import * as logger from "firebase-functions/logger";
import { Stripe } from "stripe";

import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import { UserPayoutAccount } from "../models/user_payout_account";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { CURRENCY } from "../../../constants/constants";

/**
 * @param [moneyAmount] A positive integer in cents (or local equivalent) representing how much to transfer: (400 cents == 4 dollars)
 */
export const transferMoneyToUserHandler = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  userPayoutAccount: UserPayoutAccount,
  moneyAmount: number,
  description: string
): Promise<Stripe.Response<Stripe.Transfer>> => {
  try {
    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    // ? info: withdrow to bank card

    const transfer = await stripe.transfers.create({
      amount: moneyAmount,
      currency: CURRENCY,
      destination: userPayoutAccount.id,
      description: description,
      source_type: "card",
    });

    logger.info({
      handler: "transferMoneyToUserHandler",
      transfer: transfer,
    });

    return transfer;
  } catch (error) {
    logger.error({
      handler: "transferMoneyToCustomerHandler",
      error: error,
      message: "Money transfer error",
    });
    throw new IternalFeatureException(
      "Money transfer error",
      IternalFeatureExceptionType.MoneyNotTransferred
    );
  }
};
