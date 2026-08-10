import * as Yup from "yup";

export const leaveReviewSchema = Yup.object({
  rating: Yup.number()
    .required("Please select a rating.")
    .min(1, "Please select a rating.")
    .max(5, "Rating must be between 1 and 5."),

  comment: Yup.string().trim().max(500, "Review cannot exceed 500 characters."),
});
