import { BaseHttpException } from "./BaseHttpException";

export class TransactionNotFound extends BaseHttpException {
  constructor() {
    super(404, "NOT_FOUND", "A transação informada não existe.");
  }
}
