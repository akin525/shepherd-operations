import z from "zod";

export const EscalationSchema = z.object({
  escalationType: z.string().min(1, "Escalation type is required"),
  staffId: z.string().min(1, "Please provide staff ID"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  image: z
      .any() // Use .any() to handle the initial null/undefined state smoothly
      .refine((file) => !file || file instanceof File, "Invalid file type")
      .refine((file) => !file || file.size <= 5120000, "Image must be less than 5MB")
      .refine(
          (file) =>
              !file || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
          "Only .jpg, .jpeg, .png and .webp formats are supported"
      )
      .optional(),
});

export type EscalationType = z.infer<typeof EscalationSchema>;