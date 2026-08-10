import * as Yup from "yup";

export const workerProfileSchema = Yup.object({
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

  city: Yup.string().trim().required("City is required."),

  primarySkill: Yup.string().trim().required("Primary skill is required."),

  experience: Yup.number()
    .typeError("Experience must be a number.")
    .min(0, "Experience cannot be negative.")
    .required("Experience is required."),

  bio: Yup.string().trim().max(500, "Bio cannot exceed 500 characters."),

  skills: Yup.array().of(Yup.string().trim()).min(1, "Add at least one skill."),
});
