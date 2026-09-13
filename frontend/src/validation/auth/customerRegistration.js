import * as yup from "yup";

import {
  fullNameSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  confirmPasswordSchema,
  citySchema,
} from "./common";

export const customerRegistrationSchema = yup.object({
  fullName: fullNameSchema,

  email: emailSchema,

  phone: phoneSchema,

  password: passwordSchema,

  confirmPassword: confirmPasswordSchema,

  city: citySchema,
});
