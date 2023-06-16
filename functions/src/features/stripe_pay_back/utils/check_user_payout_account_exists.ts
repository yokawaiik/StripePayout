import { DecodedIdToken } from "firebase-admin/auth";
import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import { UserPayoutAccountMapper } from "../mappers/user_payout_account_mapper";
import { UserPayoutAccountStatus } from "../models/user_payout_account_status";

export const checkUserPayoutAccountExists = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  decodedUserToken: DecodedIdToken
): Promise<boolean> => {
  const stripeUserAccount = await stripeIntegrationConfig.customers
    .doc(decodedUserToken!.uid)
    .get();

  if (stripeUserAccount.exists === false) return false;

  const customer = UserPayoutAccountMapper.fromDocument(stripeUserAccount);

  if (customer.status == UserPayoutAccountStatus.Active) {
    return true;
  }

  return false;
};
