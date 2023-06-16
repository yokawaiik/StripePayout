import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { UserPayoutAccount } from "../models/user_payout_account";
import { convertCentsToDollars } from "./convert_cents_to_dollars";
import Stripe from "stripe";

export const createWithdrawalCheckDocument = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  userAccount: UserPayoutAccount,
  transfer: Stripe.Transfer
): Promise<void> => {
  try {
    const amountInDollars = convertCentsToDollars(transfer.amount);

    await stripeIntegrationConfig.withdrawalChecks.doc(transfer.id).set({
      customerUID: userAccount.id,
      createdAt: new Date(transfer.created * 1000),
      amount: amountInDollars,
      transferObject: transfer,
    });
  } catch (error) {
    throw new IternalFeatureException(
      "Create customer account document ended with error.",
      IternalFeatureExceptionType.WriteDatabaseError
    );
  }
};
