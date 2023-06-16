import * as logger from "firebase-functions/logger";
import { Stripe } from "stripe";

import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import { processStripeEventData } from "./process_stripe_event_data";
import { IternalEventException } from "../exceptions/iternal_event_exception";

export const processVerifiedStripeEvent = async (
  stripeEvent: Stripe.Event,
  stripeIntegrationConfig: StripeIntegrationConfig
) => {
  try {
    logger.info("Recorded stripe event", { event: stripeEvent });

    await stripeIntegrationConfig.events.doc(stripeEvent.id).set(stripeEvent);

    // process it
    await processStripeEventData(stripeEvent, stripeIntegrationConfig);
  } catch (error) {
    if (error instanceof IternalEventException) {
      throw error;
    }

    throw error;
  }
};
