import { BaseHttpException } from "./BaseHttpException";

export class UserExistsException extends BaseHttpException {
  constructor(email: string) {
        super(400, "BAD_REQUEST", `O email ${email} já está cadastrado`);
    }
}
