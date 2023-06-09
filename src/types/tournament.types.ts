import z from "zod";

// Creating tournament
export const NewPlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const NewTeamsSchema = z.object({
  id: z.number(),
  name: z.string(),
  players: z.array(NewPlayerSchema),
});

export const NewTournamentSchema = z.object({
  name: z.string(),
  sets: z.number(),
  kind: z.enum(["king", "teams"]),
  king: z.object({
    players: z.array(NewPlayerSchema),
  }),
  teams: z.array(NewTeamsSchema),
});

export type NewTeamsType = z.infer<typeof NewTeamsSchema>;
export type NewPlayerType = z.infer<typeof NewPlayerSchema>;
export type NewTournamentType = z.infer<typeof NewTournamentSchema>;

// Tournament DB
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  tournamentId: z.string(),
});

export type TeamType = z.infer<typeof TeamSchema>;
