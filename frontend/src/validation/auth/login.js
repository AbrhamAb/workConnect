import * as yup from "yup";

import { emailSchema, requiredPasswordSchema } from "./common";

export const loginSchema = yup.object({
  email: emailSchema,

  password: requiredPasswordSchema,
});
