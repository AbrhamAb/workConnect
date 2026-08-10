import * as yup from "yup";

import { emailSchema } from "./common";

export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});
