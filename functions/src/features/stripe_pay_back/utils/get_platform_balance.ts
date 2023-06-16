import { Stripe } from "stripe";
import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../exceptions/iternal_feature_exception";
import { CURRENCY } from "../../../constants/constants";

export const getPlatformBalance = async (
  stripeIntegrationConfig: StripeIntegrationConfig
): Promise<number> => {
  try {
    const stripe = new Stripe(process.env[stripeIntegrationConfig.apiKey]!, {
      apiVersion: "2022-11-15",
    });

    const balance = await stripe.balance.retrieve();

    const currency = balance.available.find(
      (currency) => currency.currency === CURRENCY
    );

    if (!currency) {
      // throw new ("Currency not found");
      throw new IternalFeatureException(
        "Currency not found",
        IternalFeatureExceptionType.CurrencyNotFound
      );
    }

    return currency.amount;
  } catch (error) {
    if (error instanceof IternalFeatureException) {
      throw error;
    }

    throw new IternalFeatureException(
      "Currency not found",
      IternalFeatureExceptionType.Unexpected
    );
  }
};
