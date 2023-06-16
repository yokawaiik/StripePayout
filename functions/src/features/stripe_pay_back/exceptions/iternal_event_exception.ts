export enum IternalEventExceptionType {
  CustomerCreated = "Customer not created.",
  CustomerUpdated = "Customer not updated.",
  CustomerDeleted = "Customer not deleted.",
  Unexpected = "Unexepected event type.",
  CustomerNotFound = "Account not found in database.",
}

export class IternalEventException extends Error {
  type: IternalEventExceptionType;

  constructor(message: string, type: IternalEventExceptionType) {
    super(message);
    this.type = type;
  }
}
