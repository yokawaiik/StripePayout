import { DecodedIdToken } from "firebase-admin/auth";
import Stripe from "stripe";
import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { UserPayoutAccountStatus } from "../models/user_payout_account_status";

export const createUserPayoutAccountDocument = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  decodedUserToken: DecodedIdToken,
  createdUserPayoutAccount: Stripe.Account
): Promise<void> => {
  try {
    await stripeIntegrationConfig.customers.doc(decodedUserToken!.uid).set({
      uid: decodedUserToken.uid,
      id: createdUserPayoutAccount?.id,
      email: decodedUserToken?.email,
      updatedAt: Date(),
      createdAt: Date(),
      status: UserPayoutAccountStatus.Inactive,
    });
  } catch (error) {
    throw new IternalFeatureException(
      "Create customer account document ended with error.",
      IternalFeatureExceptionType.WriteDatabaseError
    );
  }
};
