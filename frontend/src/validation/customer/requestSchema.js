import * as Yup from "yup";

export const requestSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Request title is required.")
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters."),

  description: Yup.string()
    .trim()
    .required("Please describe the work you need.")
    .min(20, "Description must be at least 20 characters.")
    .max(1000, "Description cannot exceed 1000 characters."),

  location: Yup.string()
    .trim()
    .required("Location is required.")
    .max(200, "Location cannot exceed 200 characters."),

  date: Yup.string().required("Please select your preferred date and time."),

  budget: Yup.string().trim().max(100, "Budget cannot exceed 100 characters."),

  photos: Yup.array().max(5, "You can upload a maximum of 5 photos."),
});
