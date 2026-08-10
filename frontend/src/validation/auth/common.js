import * as yup from "yup";

export const fullNameSchema = yup
  .string()
  .trim()
  .required("Full name is required.")
  .min(3, "Please enter your full name.");

export const emailSchema = yup
  .string()
  .trim()
  .email("Enter a valid email address.")
  .required("Email is required.");

export const phoneSchema = yup
  .string()
  .trim()
  .required("Phone number is required.");

export const requiredPasswordSchema = yup
  .string()
  .required("Password is required.");

export const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters.")
  .required("Password is required.");

export const confirmPasswordSchema = yup
  .string()
  .oneOf([yup.ref("password")], "Passwords do not match.")
  .required("Confirm your password.");

export const citySchema = yup.string().trim().required("City is required.");
