import z from "zod";

export const ResetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "current password is required"),
    newPassword: z
      .string()
      .min(1, "new password is required")
      .min(6, "password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
