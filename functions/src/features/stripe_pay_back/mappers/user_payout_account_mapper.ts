import { UserPayoutAccount } from "../models/user_payout_account";

export class UserPayoutAccountMapper {
  public static fromDocument(
    documentData: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ): UserPayoutAccount {
    const data = documentData.data() ?? {};
    return new UserPayoutAccount(
      data["uid"] ?? null,
      data["id"] ?? null,
      data["email"] ?? null,
      data["updatedAt"] ?? null,
      data["createdAt"] ?? null,
      data["status"] ?? null
    );
  }
}
