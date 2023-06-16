import { StripeIntegrationConfig } from "../models/stripe_integration_config_model";
import { firestoreInstance } from "../../../firebase_config/firebase_config";
import {
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  USERS_COLLECTION_NAME,
} from "../../../constants/constants";

// stripe integration config
const stripeIntegrationConfig = new StripeIntegrationConfig(
  STRIPE_API_KEY,
  "2022-11-15",
  STRIPE_WEBHOOK_SECRET,
  firestoreInstance.collection("stripe_events"),
  firestoreInstance.collection("stripe_payout_accounts"),
  firestoreInstance.collection("stripe_errors"),
  firestoreInstance.collection("stripe_withdrawal_checks"),
  firestoreInstance.collection(USERS_COLLECTION_NAME)
);

export { stripeIntegrationConfig };
