import * as Yup from "yup";

export const customerProfileSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required("Full name is required.")
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email is required."),

  phone: Yup.string().trim().required("Phone number is required."),

  address: Yup.string()
    .trim()
    .required("Address is required.")
    .max(200, "Address cannot exceed 200 characters."),
});
