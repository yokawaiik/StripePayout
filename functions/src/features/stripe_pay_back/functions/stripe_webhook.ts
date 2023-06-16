import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import { stripeIntegrationConfig } from "../stripe_configuration/stripe_configuration";
import { processStripeEvent } from "../utils/process_stripe_event";
import {
  IternalEventException,
  IternalEventExceptionType,
} from "../exceptions/iternal_event_exception";
import {
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../../constants/constants";

export const stripeWebhook = onRequest(
  { secrets: [STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET] },
  async (request, response) => {
    try {
      logger.log("Received stripe event", {
        id: request.body?.id,
        type: request.body?.type,
      });
      await processStripeEvent(request, stripeIntegrationConfig);
      response.status(200).send("stripeWebhook: Ok");
    } catch (error) {
      let message = "Unexpected error";
      let code = 500;

      if (error instanceof IternalEventException) {
        message = error.type.toString();

        switch (error.type) {
          case IternalEventExceptionType.CustomerNotFound:
          case IternalEventExceptionType.Unexpected:
          default:
            code = 500;
        }
      }

      logger.error({
        message: message,
        request: request,
        error: error,
      });

      response.status(code).send({
        errorHeader: "stripeWebhook: Invalid request",
        errorMessage: message,
      });
    }
  }
);
