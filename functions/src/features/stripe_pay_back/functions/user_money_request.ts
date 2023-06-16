import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { stripeIntegrationConfig } from "../stripe_configuration/stripe_configuration";
import { validUserToken } from "../../../utils/auth/valid_user_token";
import { decodeUserToken } from "../../../utils/auth/decode_user_token";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";

import { getUserPayoutAccountByUID } from "../utils/get_user_payout_account_by_uid";
import { createWithdrawalCheckDocument } from "../utils/create_withdrawal_check_document";
import { createErrorDocument } from "../utils/create_error_document";
import { getPlatformBalance } from "../utils/get_platform_balance";
import { UserPayoutAccount } from "../models/user_payout_account";
import { validatePossibilityTransferringMoney } from "../utils/validate_possibility_transferring_money";
import {
  STRIPE_API_KEY,
  TRANSFER_MIN,
  TRANSFER_MONEY_TO_USER_DESCRIPTION,
} from "../../../constants/constants";
import { debitMoneyTheAccount } from "../utils/debit_money_the_account";
import { getMissingBodyRequiredParams } from "../utils/get_missing_body_required_source_params";
import { checkUserPayoutAccountExists } from "../utils/check_user_payout_account_exists";
import { getUserBalanceByUID } from "../utils/get_user_balance_by_uid";
import { transferMoneyToUserHandler } from "../utils/transfer_money_to_customer_handler";
import { validateNumber } from "../utils/validate_number";

export const userMoneyRequest = onRequest(
  { secrets: [STRIPE_API_KEY] },
  async (request, response) => {
    let userAccount: UserPayoutAccount | null = null;
    try {
      const decodedUserToken = await decodeUserToken(request);
      if (decodedUserToken === null) {
        logger.info({
          message: "Token not found.",
          request: request,
        });
        response.status(400).json({
          error: "Not Authorized",
        });
        return;
      }
      // boiler plate verifiction
      const isValidToken: boolean = await validUserToken(decodedUserToken);
      if (!isValidToken) {
        logger.info({
          message: "Token not valid.",
          request: request,
        });
        response.status(400).json({
          error: "Not Authorized",
        });
        return;
      }
      //

      // ? info: check if params is valid
      const missingParams = getMissingBodyRequiredParams(request.body, [
        "amount",
      ]);
      if (missingParams.length !== 0) {
        response.status(400).send({
          error: "Missing required source parameters.",
          missingParams,
        });
        return;
      }

      // ? info: check if amount is valid
      const moneyAmount = Number(request.body.amount);

      if (
        Math.sign(moneyAmount) !== 1 ||
        !validateNumber(request.body.amount)
      ) {
        response.status(400).send({
          error: "Amount must be a positive integer number.",
          extra: {
            value: request.body.amount,
          },
        });
        return;
      }

      if (moneyAmount <= TRANSFER_MIN) {
        response.status(400).send({
          error: `User can't transfer less than ${TRANSFER_MIN} cents.`,
          extra: {
            value: request.body.amount,
          },
        });
        return;
      }

      userAccount = await getUserPayoutAccountByUID(
        stripeIntegrationConfig,
        decodedUserToken!.uid
      );

      logger.info({
        message: "User requested to transfer money.",
        request: request,
      });

      // ? check if user exists
      const stripeUserAccountExists = await checkUserPayoutAccountExists(
        stripeIntegrationConfig,
        decodedUserToken!
      );
      if (!stripeUserAccountExists) {
        response.status(400).send({
          error: "Account creating error",
          message: "Account already exists.",
        });
        return;
      }

      // ? info: check if customer can get required sum of money

      const userBalance = await getUserBalanceByUID(
        stripeIntegrationConfig,
        decodedUserToken!.uid
      );

      // ? info: check if balance is enough to transfer such sum of money
      const platformBalance = await getPlatformBalance(stripeIntegrationConfig);

      // logger.info({
      //   message: "Balances",
      //   userBalance: userBalance,
      //   platformBalance: platformBalance,
      //   moneyAmount: moneyAmount,
      // });

      const isMoneyTransferPossible = validatePossibilityTransferringMoney(
        userAccount,
        userBalance,
        platformBalance,
        moneyAmount
      );

      if (isMoneyTransferPossible != null) {
        const message = `Insufficient funds on user account. ${isMoneyTransferPossible}`;
        logger.info({
          message: message,
          request: request,
        });
        response.status(400).send({
          error: message,
        });
        return;
      }

      // ? info: transfer money to user
      const transferResponse = await transferMoneyToUserHandler(
        stripeIntegrationConfig,
        userAccount,
        moneyAmount,
        TRANSFER_MONEY_TO_USER_DESCRIPTION
      );

      // ? info: check if money transfer was successful

      await createWithdrawalCheckDocument(
        stripeIntegrationConfig,
        userAccount,
        transferResponse
      );

      if (transferResponse.amount !== 0) {
        await debitMoneyTheAccount(
          stripeIntegrationConfig,
          userAccount.uid,
          transferResponse.amount,
          userBalance
        );
      }

      if (transferResponse.reversed === true) {
        await createErrorDocument(
          stripeIntegrationConfig,
          userAccount,
          `Money transfer error with the reason: ${transferResponse.reversals.data}.`
        );
        response.status(500).send({
          error: "Money transfer reversed.",
          transferResponse: transferResponse,
        });
        return;
      }

      logger.info({
        message: "Money transfer successful.",
        request: request,
      });

      response.status(200).send({
        message: "Money transfer successful.",
        transferResponse: transferResponse,
      });
    } catch (error) {
      let message = "Unexpected error";
      let code = 500;

      if (error instanceof IternalFeatureException) {
        message = error.type.toString();

        switch (error.type) {
          case IternalFeatureExceptionType.WriteDatabaseError:
          case IternalFeatureExceptionType.Unexpected:
          case IternalFeatureExceptionType.CurrencyNotFound:
            code = 500;
            break;
          default:
            code = 400;
        }
      }

      logger.error({
        message: message,
        request: request,
        error: error,
      });

      if (userAccount !== null) {
        // ? info: create error document only if transferring went wrong
        createErrorDocument(stripeIntegrationConfig, userAccount, `${message}`);
      }

      response.status(code).send({ error: message });
    }
  }
);
