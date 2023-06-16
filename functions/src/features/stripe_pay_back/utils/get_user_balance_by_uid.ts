import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { USER_BALANCE_FIELD_NAME } from "../../../constants/constants";
import { toFixedNumber } from "./to_fixed_number";
import { convertDollarsToCents } from "./convert_dollars_to_cents";

export const getUserBalanceByUID = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  uid: string
): Promise<number> => {
  try {
    const userAccountDocument = await stripeIntegrationConfig.users
      .doc(uid)
      .get();

    if (!userAccountDocument.exists) {
      throw new IternalFeatureException(
        "User document with balance field not found.",
        IternalFeatureExceptionType.AccountNotFound
      );
    }

    const customerRawBalance = userAccountDocument.data()![
      USER_BALANCE_FIELD_NAME
    ] as number;

    const customerBalanceInCents = convertDollarsToCents(
      toFixedNumber(customerRawBalance, 2)
    );

    return customerBalanceInCents;
  } catch (error) {
    if (error instanceof IternalFeatureException) {
      throw error;
    }

    throw new IternalFeatureException(
      "Unexpected error.",
      IternalFeatureExceptionType.Unexpected
    );
  }
};
