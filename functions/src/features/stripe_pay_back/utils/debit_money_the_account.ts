import * as logger from "firebase-functions/logger";

import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";

import { FieldValue } from "firebase-admin/firestore";
import { convertCentsToDollars } from "./convert_cents_to_dollars";
import { toFixedNumber } from "./to_fixed_number";

/**
 * @param [moneyAmount] A positive integer in cents (or local equivalent) representing how much to transfer: (400 cents == 4 dollars)
 */
export const debitMoneyTheAccount = async (
  stripeIntegrationConfig: StripeIntegrationConfig,
  uid: string,
  amount: number,
  lastUserBalanceValue: number
): Promise<void> => {
  const debitedMoney = toFixedNumber(convertCentsToDollars(amount), 2);

  logger.info({
    handler: "validateTransferMoneyAndDebitTheAccount",
    debitMoney: debitedMoney,
  });

  // ? info: to exclude value like an exponent
  const value =
    toFixedNumber(lastUserBalanceValue - debitedMoney, 2) <= 0
      ? 0
      : FieldValue.increment(-debitedMoney);

  await stripeIntegrationConfig.users.doc(uid).update({
    balance: value,
  });
};
