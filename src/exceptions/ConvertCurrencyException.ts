import { BaseHttpException } from "./BaseHttpException";

export class ConvertCurrencyException extends BaseHttpException {
  constructor(fromCurrency, toCurrency) {
        super(400, "BAD_REQUEST", `Impossível converter a moeda ${fromCurrency} para ${toCurrency}`);
    }
}