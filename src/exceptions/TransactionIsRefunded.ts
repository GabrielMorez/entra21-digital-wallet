import { BaseHttpException } from "./BaseHttpException";

export class TransactionIsRefunded extends BaseHttpException {
  constructor() {
    super(400, "BAD_REQUEST", "A transação já foi estornada.");
  }
}
