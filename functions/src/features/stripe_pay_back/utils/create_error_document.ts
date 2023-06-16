import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { UserPayoutAccount } from "../models/user_payout_account";

export const createErrorDocument = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  userAccount: UserPayoutAccount,
  text: string
): Promise<void> => {
  try {
    await stripeIntegrationConfig.errors.add({
      customerUID: userAccount.id,
      createdAt: Date(),
      text: text,
    });
  } catch (error) {
    throw new IternalFeatureException(
      "Create error document ended with error.",
      IternalFeatureExceptionType.WriteDatabaseError
    );
  }
};
