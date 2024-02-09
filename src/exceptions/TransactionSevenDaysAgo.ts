import { BaseHttpException } from "./BaseHttpException";

export class TransactionSevenDaysAgo extends BaseHttpException {
  constructor() {
    super(400, "BAD_REQUEST", "Esta transação é de 7 dias atrás ou mais. Impossível estorná-la.");
  }
}
