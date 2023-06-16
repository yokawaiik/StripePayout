import { Request } from "firebase-functions/lib/v2/providers/https";
import { DecodedIdToken } from "firebase-admin/auth";
import { firebaseAuth } from "../../firebase_config/firebase_config";
import {
  IternalFeatureException,
  IternalFeatureExceptionType,
} from "../../features/stripe_pay_back/exceptions/iternal_feature_exception";

// ? info: Header: Authorization: Token [auth_token]

export const decodeUserToken = async (
  request: Request
): Promise<DecodedIdToken | null> => {
  try {
    const authorization = request.get("Authorization");

    const token = authorization;

    if (token === undefined) {
      return null;
    }

    const decodedToken = await firebaseAuth
      .verifyIdToken(token)
      .then((decodedToken) => decodedToken)
      .catch(() => null);

    return decodedToken;
  } catch (error: any) {
    let message = "Unexpected error";
    let type = IternalFeatureExceptionType.Unexpected;

    if (error?.code !== null) {
      switch (error.code as string) {
        case "auth/id-token-expired":
          message = "Token expired";
          type = IternalFeatureExceptionType.TokenExpired;
          break;
        case "auth/id-token-revoked":
          message = "Token revoked";
          type = IternalFeatureExceptionType.TokenRevoked;
          break;
        case "auth/user-disabled":
          message = "Token revoked";
          type = IternalFeatureExceptionType.TokenRevoked;
          break;
        default:
          message = "Unexpected token error";
          type = IternalFeatureExceptionType.UnexpectedTokenError;
          break;
      }
    }

    throw new IternalFeatureException(message, type);
  }
};
