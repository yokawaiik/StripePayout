import { UserPayoutAccountStatus } from "./user_payout_account_status";

/**
 * @param [id] it's a Stripe customer id
 * @param [source] it's a payment source of customer
 */
export class UserPayoutAccount {
  uid: string;
  id: string;
  email: string;
  updatedAt: Date;
  createdAt: Date;
  status: UserPayoutAccountStatus;

  constructor(
    uid: string,
    id: string,
    email: string,
    updatedAt: Date,
    createdAt: Date,
    status: UserPayoutAccountStatus
  ) {
    this.uid = uid;
    this.id = id;
    this.email = email;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.status = status;
  }
}
