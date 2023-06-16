import { DecodedIdToken } from "firebase-admin/auth";

export const validUserToken = async (
  decodedIdToken: DecodedIdToken | null
): Promise<boolean> => {
  if (decodedIdToken === null) {
    return false;
  }

  if (Date.parse(decodedIdToken.expires_at) <= Date.now()) {
    return false;
  }

  return true;
};
