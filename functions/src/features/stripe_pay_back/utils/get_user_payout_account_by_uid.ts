import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { UserPayoutAccount } from "../models/user_payout_account";
import { UserPayoutAccountMapper } from "../mappers/user_payout_account_mapper";
import * as logger from "firebase-functions/logger";

export const getUserPayoutAccountByUID = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  uid: string
): Promise<UserPayoutAccount> => {
  try {
    const customerUserAccountDocument = await stripeIntegrationConfig.customers
      .doc(uid)
      .get();

    if (customerUserAccountDocument.exists === false) {
      throw new IternalFeatureException(
        "Customer account not found.",
        IternalFeatureExceptionType.AccountNotFound
      );
    }

    const customerAccount = UserPayoutAccountMapper.fromDocument(
      customerUserAccountDocument
    );

    return customerAccount;
  } catch (error) {
    if (error instanceof IternalFeatureException) {
      throw error;
    }

    logger.error({
      handler: "getCustomerAccountByUID",
      message: "Unexpected error getting customer account.",
      error: error,
    });

    throw new IternalFeatureException(
      "Unexpected error.",
      IternalFeatureExceptionType.Unexpected
    );
  }
};
