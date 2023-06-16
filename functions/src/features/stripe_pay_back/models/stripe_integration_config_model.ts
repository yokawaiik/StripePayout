import { CollectionReference } from "firebase-admin/firestore";
// import { SecretParam } from "firebase-functions/lib/params/types";

/**
 * [users] - collection contains balance field
 */
export class StripeIntegrationConfig {
  apiKey: string;
  apiVersion: string;
  webhookSecret: string;
  events: CollectionReference;
  customers: CollectionReference;
  errors: CollectionReference;
  withdrawalChecks: CollectionReference;

  users: CollectionReference;

  constructor(
    apiKey: string,
    apiVersion: string,
    webhookSecret: string,
    events: CollectionReference,
    customers: CollectionReference,
    errors: CollectionReference,
    withdrawalChecks: CollectionReference,
    users: CollectionReference
  ) {
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
    this.webhookSecret = webhookSecret;
    this.events = events;
    this.customers = customers;
    this.errors = errors;
    this.withdrawalChecks = withdrawalChecks;
    this.users = users;
  }
}
