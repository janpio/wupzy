import { z } from "zod";

const UserZodSchema = z.object({
  id: z.string(),
  email: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  subscriptionStatus: z.string(),
});

export type UserType = z.infer<typeof UserZodSchema>;