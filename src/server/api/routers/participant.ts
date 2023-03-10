import createIdsArrays from "server/api/routers/utils/createIdsArrays";
import { createTRPCRouter, protectedProcedure } from "server/api/trpc";
import createAllPossiblePairsInGroup from "utils/createAllPossiblePairsInGroup";
import createGames from "utils/createGames";
import sortParticipantsByGroup from "utils/sortParticipantsByGroup";
import { z } from "zod";

export const participantRouter = createTRPCRouter({
  getTournamentParticipants: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const participants = await ctx.prisma.participant.findMany({
        where: {
          tournamentId: input.id,
        },
      });

      const sorted = sortParticipantsByGroup(participants);

      return { participants: sorted };
      // return { sortParticipantsByGroup(participants) };
    }),

  addParticipant: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        group: z.string(),
        score: z.number(),
        tournamentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.prisma.participant.create({
        data: {
          name: input.name,
          group: input.group,
          score: input.score,
          tournamentId: input.tournamentId,
        },
      });

      return { team };
    }),

  updatedParticipant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        score: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.prisma.participant.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          score: input.score,
        },
      });

      return { participant };
    }),

  getParticipantGames: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const games = await ctx.prisma.games.findMany({
        where: {
          id: input.id,
        },
      });

      return { games };
    }),

  deleteParticipant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const games = await ctx.prisma.games.findMany({
        where: {
          OR: [
            {
              participant_team_1: {
                some: {
                  id: input.id,
                },
              },
            },
            {
              participant_team_2: {
                some: {
                  id: input.id,
                },
              },
            },
          ],
        },
      });

      // for (const game of games) {
      //   await ctx.prisma.games.delete({ where: { id: game.id } });
      // }
      await Promise.all(
        games.map((game) =>
          ctx.prisma.games.delete({
            where: {
              id: game.id,
            },
          })
        )
      );

      await ctx.prisma.participant.delete({ where: { id: input.id } });

      // return { team };
    }),

  updateParticipants: protectedProcedure
    .input(
      z.object({
        teams: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            group: z.string(),
            score: z.number(),
          })
        ),
        tournamentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (const team of input.teams) {
        await ctx.prisma.participant.update({
          where: {
            id: team.id,
          },
          data: {
            name: team.name,
            group: team.group,
            score: team.score,
          },
        });
      }

      // Before creating new games, delete all old games
      await ctx.prisma.games.deleteMany({
        where: { tournamentId: input.tournamentId },
      });

      const participants = await ctx.prisma.participant.findMany({
        where: {
          tournamentId: input.tournamentId,
        },
      });

      const participantsMap = createAllPossiblePairsInGroup(participants);
      const gamesMap = createGames(participantsMap);

      await createIdsArrays(
        gamesMap,
        async (group, firsIds, secondIds, index) => {
          await ctx.prisma.games.create({
            data: {
              group,
              gameOrder: index + 1,
              tournamentId: input.tournamentId,
              participant_team_1: {
                connect: [...firsIds],
              },
              participant_team_2: {
                connect: [...secondIds],
              },
            },
          });
        }
      );

      return { teams: input.teams };
    }),
});