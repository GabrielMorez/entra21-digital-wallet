import { BaseHttpException } from "./BaseHttpException";

export class InvalidUserOrPasswordException extends BaseHttpException {
  constructor() {
    super(400, "BAD_REQUEST", "Usuário ou senha inválidos");
  }
}
