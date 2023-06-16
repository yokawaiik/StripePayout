import { Stripe } from "stripe";

import { Request } from "firebase-functions/v2/https";

import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import { processVerifiedStripeEvent } from "./process_veryfied_stripe_event";

import { IternalEventException } from "../exceptions/iternal_event_exception";

export const processStripeEvent = async (
  request: Request,
  stripeIntegrationConfig: StripeIntegrationConfig
) => {
  try {
    // verify the event
    const signature = request.headers["stripe-signature"] || "";

    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    const rawBody = request.rawBody.toString();
    const stripeEvent = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env[stripeIntegrationConfig.webhookSecret]!
    );

    // record the event
    await processVerifiedStripeEvent(stripeEvent, stripeIntegrationConfig);
  } catch (error) {
    if (error instanceof IternalEventException) {
      throw error;
    }

    throw error;
  }
};
