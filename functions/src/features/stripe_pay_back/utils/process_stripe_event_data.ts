import * as logger from "firebase-functions/logger";
import { Stripe } from "stripe";

import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import {
  IternalEventException,
  IternalEventExceptionType,
} from "../exceptions/iternal_event_exception";
import { UserPayoutAccountStatus } from "../models/user_payout_account_status";
import { getUserPayoutAccountByUID } from "./get_user_payout_account_by_uid";

export const processStripeEventData = async (
  stripeEvent: Stripe.Event,
  stripeIntegrationConfig: StripeIntegrationConfig
) => {
  try {
    const eventDataObject = stripeEvent.data.object as any;

    const userUID = eventDataObject["metadata"]["uid"] as string;

    if (userUID == null) {
      throw new IternalEventException(
        "Customer not found.",
        IternalEventExceptionType.CustomerNotFound
      );
    }

    // ? info: support events:
    // account.updated - update any fields
    // account.application.deauthorized - sign out account
    const userPayoutAccount = await getUserPayoutAccountByUID(
      stripeIntegrationConfig,
      userUID
    );

    switch (stripeEvent.type) {
      // case "account.application.deauthorized":
      //   await stripeIntegrationConfig.customers.doc(userUID).update({
      //     "status": UserPayoutAccountStatus.Inactive,
      //     "updatedAt": Date(),
      //   });
      //   break;

      case "account.updated":
        const isUserPayoutAccountActive = eventDataObject[
          "payouts_enabled"
        ] as boolean;

        logger.info({
          isUserPayoutAccountActive: isUserPayoutAccountActive,
          status: userPayoutAccount.status,
        });

        if (
          (isUserPayoutAccountActive === true &&
            userPayoutAccount.status == UserPayoutAccountStatus.Active) ||
          (isUserPayoutAccountActive === false &&
            userPayoutAccount.status == UserPayoutAccountStatus.Inactive)
        ) {
          return;
        }

        await stripeIntegrationConfig.customers.doc(userUID).update({
          "status": isUserPayoutAccountActive
            ? UserPayoutAccountStatus.Active
            : UserPayoutAccountStatus.Inactive,
          "updatedAt": Date(),
        });

        break;
      default:
        logger.warn("Unexpected event type.");
    }
  } catch (error) {
    if (error instanceof IternalEventException) {
      throw error;
    }
    const message = "Unexpected error";

    await stripeIntegrationConfig.errors.doc(stripeEvent.id).set({
      event: stripeEvent,
      message: message,
      createdAt: Date(),
    });

    throw error;
  }
};
