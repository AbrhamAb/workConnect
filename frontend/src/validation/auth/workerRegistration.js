import * as yup from "yup";

import {
  fullNameSchema,
  emailSchema,
  phoneSchema,
  passwordSchema,
  confirmPasswordSchema,
  citySchema,
} from "./common";

const stepOneSchema = yup.object({
  fullName: fullNameSchema,

  email: emailSchema,

  phone: phoneSchema,

  password: passwordSchema,

  confirmPassword: confirmPasswordSchema,

  primarySkill: yup.string().required("Choose a primary skill."),

  experience: yup.string().required("Select experience."),

  city: citySchema,
});

const stepTwoSchema = yup.object({
  skills: yup
    .array()
    .min(1, "Select at least one skill.")
    .required("Select at least one skill."),
});

const stepThreeSchema = yup.object({
  bio: yup
    .string()
    .trim()
    .required("Tell customers about yourself.")
    .min(20, "Please provide a little more information about yourself."),
});

export const workerSchemas = {
  1: stepOneSchema,
  2: stepTwoSchema,
  3: stepThreeSchema,
};
