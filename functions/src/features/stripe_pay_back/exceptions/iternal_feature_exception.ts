/**
 * AccountNotCreated - status: 400
 * AccountHasAlreadyBeenCreated - status: 400
 * LinkNotCreated - status: 400
 * MoneyNotTransferred - status: 400
 * AccountNotFound - status: 400
 * WriteDatabaseError - status: 500
 * Unexpected - status: 500
 * CurrencyNotFound - status: 500
 * CancelTrasferring - status: 400 | 500
 */
export enum IternalFeatureExceptionType {
  AccountNotCreated = "Customer account not created.",
  AccountHasAlreadyBeenCreated = "Customer has already been created.",
  LinkNotCreated = "Link not created.",
  MoneyNotTransferred = "Money not transferred.",
  AccountNotFound = "Account not found in database.",
  WriteDatabaseError = "Write database error.",
  Unexpected = "Unexepected error.",
  CurrencyNotFound = "Currency not found.",
  CancelTrasferring = "Cancel trasferring.",
  TokenExpired = "Token Expired.",
  TokenRevoked = "Token Revoked.",
  UnexpectedTokenError = "Unexpected Token Error.",
  UserPayoutStripeAccountNotFound = "User connected account not found in Stripe platform.",
}

export class IternalFeatureException extends Error {
  type: IternalFeatureExceptionType;

  constructor(message: string, type: IternalFeatureExceptionType) {
    super(message);
    this.type = type;
  }
}
