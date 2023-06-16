import { UserPayoutAccount } from "../models/user_payout_account";
import { UserPayoutAccountStatus } from "../models/user_payout_account_status";

export const validatePossibilityTransferringMoney = (
  userPayoutAccount: UserPayoutAccount,
  userBalance: number,
  platformBalance: number,
  amount: number
): string | null => {
  try {
    let cancelReason = null;

    if (userPayoutAccount.status === UserPayoutAccountStatus.Inactive) {
      cancelReason = "User account is inactive.";
      return cancelReason;
    }

    if (isNaN(userBalance) || userBalance <= 0) {
      cancelReason = "User balance too low.";
      return cancelReason;
    }
    if (platformBalance <= 0) {
      cancelReason = "Platform balance too low.";
      return cancelReason;
    }

    if (isNaN(amount) || amount <= 0) {
      cancelReason = "Invalid required amount. Required a positive number.";
      return cancelReason;
    }

    if (amount > userBalance) {
      cancelReason = "User can not withdraw more than their balance.";
      return cancelReason;
    }

    if (amount > platformBalance) {
      cancelReason = "User can not withdraw more than platform's balance.";
      return cancelReason;
    }

    return cancelReason;
  } catch (error) {
    return "Unexpected error";
  }
};
