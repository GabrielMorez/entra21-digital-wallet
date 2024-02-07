import { BaseHttpException } from "./BaseHttpException";

export class InsufficientFundsException extends BaseHttpException {
  constructor() {
    super(400, "BAD_REQUEST", "Saldo insuficiente para esta transação na moeda informada.");
  }
}
