import z from "zod";

export const NewplanSchema = z.object({
  service: z.string().min(1, "service is required"),
  numOfStaff: z.string().min(1, "number of staff is required"),
  location: z.string().min(1, "number of location is required"),
});

export type NewPlanType = z.infer<typeof NewplanSchema>;
