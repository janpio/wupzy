import AddNewTeam from "components/elements/AddNewTeam/AddNewTeam";
import Button from "components/elements/Button/Button";
import EditTournamentCard from "components/elements/EditTournamentCard/EditTournamentCard";
import getGroupThatAreToSmall from "components/elements/EditTournamentGroup/utils/getGroupThatAreToSmall";
import EditTournamentName from "components/elements/EditTournamentName/EditTournamentName";
import GroupDropdown from "components/elements/GroupDropdown/GroupDropdown";
import ModalWrap from "components/elements/Modal/Modal";
import GridLayout from "components/layouts/GridLayout/GridLayout";
import useParticipants from "hooks/useParticipants";
import useTournament from "hooks/useTournament";
import useWindowSize from "hooks/useWindowSize";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { GrPowerReset } from "react-icons/gr";
import { RiSaveLine } from "react-icons/ri";
import type { ParticipantType, TeamsMapType } from "types/team.types";
import { api } from "utils/api";
import compareMaps from "utils/compareMaps";
import { getKeys } from "utils/teamsMapFunctions";
import SmallButton from "../SmallButton/SmallButton";
import changeGroup from "./utils/changeGroup";

interface EditTournamentGroupProps {
  isModalOpen: boolean;
  handleCloseModal: () => void;
}

const EditTournamentGroup: FC<EditTournamentGroupProps> = ({
  isModalOpen,
  handleCloseModal,
}) => {
  const { query } = useRouter();
  const { windowSize } = useWindowSize();
  const [tournamentId, setTournamentId] = useState<string>("");
  const [groupToSmall, setGroupToSmall] = useState<string[]>([]);
  const deleteTeam = api.participant.deleteParticipant.useMutation();
  const { tournament, refetchTournament } = useTournament(tournamentId);
  const [isGroupsChanged, setIsGroupsChanged] = useState<boolean>(false);
  const [teamToDelete, setTeamToDelete] = useState<ParticipantType | null>(
    null
  );
  const { mutateAsync } = api.participant.updateParticipants.useMutation();
  const [teamsByGroup, setTeamsByGroup] = useState<TeamsMapType>(new Map());
  const [changedParticipantsIds, setChangedParticipantsIds] = useState<
    string[]
  >([]);
  const [isTournamentNameChanged, setIsTournamentNameChanged] = useState(false);
  const [addNewTeamGroup, setAddNewTeamGroup] = useState<string | null>(null);
  const { participants, refetchParticipants } = useParticipants(tournamentId);
  const { refetch: refetchGames } = api.tournaments.getTournamentGames.useQuery(
    { id: tournamentId }
  );
  const [newTournamentName, setNewTournamentName] = useState<string | null>(
    null
  );
  const { mutateAsync: updateTournamentName } =
    api.tournaments.updateTournament.useMutation();

  const { mutateAsync: updateParticipant } =
    api.participant.updatedParticipant.useMutation();

  const addGroupToTournament = (group: string) => {
    const newStates = new Map(teamsByGroup);
    newStates.set(group, []);

    const sortedAsc = new Map([...newStates].sort());

    setTeamsByGroup(sortedAsc);
  };

  const handleGroupChange = (
    team: ParticipantType,
    oldGroup: string,
    newGroup: string
  ) => {
    if (!participants) return;

    const newState = changeGroup(teamsByGroup, oldGroup, newGroup, team);

    if (!compareMaps(newState, participants?.participants)) {
      setIsGroupsChanged(true);
    }

    if (compareMaps(newState, participants?.participants)) {
      setIsGroupsChanged(false);
    }

    setGroupToSmall(getGroupThatAreToSmall(newState));
    setTeamsByGroup(newState);
  };

  const handleParticipantNameChange = (
    participant: ParticipantType,
    newName: string
  ) => {
    const newStates = new Map(teamsByGroup);

    participants?.participants.get(participant.group)?.find((p) => {
      if (p.id === participant.id && p.name !== newName) {
        setChangedParticipantsIds((state) => [...state, participant.id]);
      }

      if (p.id === participant.id && p.name === newName) {
        setChangedParticipantsIds((state) =>
          state.filter((id) => id !== participant.id)
        );
      }
    });

    // find participant in group and change name
    newStates.set(participant.group, [
      ...(newStates.get(participant.group)?.map((t) => {
        if (t.id === participant.id) {
          return { ...t, name: newName };
        }
        return t;
      }) || []),
    ]);

    setTeamsByGroup(newStates);
  };

  const resetNameChange = (participant: ParticipantType) => {
    if (!participants) return;

    setTeamsByGroup(participants.participants);
    setChangedParticipantsIds((state) =>
      state.filter((id) => id !== participant.id)
    );
  };

  // after update teams, update tournament name
  const handleParticipantUpdate = async (participant: ParticipantType) => {
    await updateParticipant({
      id: participant.id,
      name: participant.name,
    });

    setChangedParticipantsIds((state) =>
      state.filter((id) => id !== participant.id)
    );

    await refetchGames();
    await refetchParticipants();
  };

  const handleTournamentName = async () => {
    if (newTournamentName) {
      await updateTournamentName({
        id: tournamentId,
        name: newTournamentName,
      });

      setIsTournamentNameChanged(false);

      await refetchTournament();
    }
  };

  const handleTournamentNameChange = (str: string) => {
    if (str === tournament?.tournament.name) {
      setIsTournamentNameChanged(false);
    }

    if (str !== tournament?.tournament.name) {
      setIsTournamentNameChanged(true);
    }

    setNewTournamentName(str);
  };

  const handleUpdateTeam = async (teamsMap: TeamsMapType) => {
    const teamsArray = [...teamsMap.values()].flat().map((team) => ({
      id: team.id,
      name: team.name,
      score: team.score,
      group: team.group,
    }));

    await mutateAsync({
      tournamentId: tournamentId,
      teams: teamsArray,
    });

    await refetchGames();
    await refetchTournament();
    await refetchParticipants();
  };

  const handleDeleteTeam = async (participant: ParticipantType) => {
    await deleteTeam.mutateAsync({
      id: participant.id,
    });
    await refetchGames();
    await refetchParticipants();
  };

  useEffect(() => {
    if (!query.tournamentsId || typeof query.tournamentsId !== "string") return;

    setTournamentId(query.tournamentsId);
  }, [query.tournamentsId]);

  useEffect(() => {
    if (!tournament) return;
    setNewTournamentName(tournament.tournament.name);
  }, [tournament]);

  useEffect(() => {
    if (!participants) return;

    setTeamsByGroup(participants.participants);
    setGroupToSmall(getGroupThatAreToSmall(participants.participants));
  }, [participants]);

  return (
    <ModalWrap
      modalWidth="7xl"
      topPosition="top"
      isModalVisible={isModalOpen}
      modalTitle="Edit tournament groups"
      handleCancelClick={handleCloseModal}
    >
      <div className="mt-3 mb-6 flex w-full justify-between">
        <div className="flex">
          <EditTournamentName
            newTournamentName={newTournamentName}
            setNewTournamentName={handleTournamentNameChange}
          />
          {isTournamentNameChanged && (
            <>
              <SmallButton
                btnTitle={<RiSaveLine className="h-6 w-6" />}
                btnClassNames="h-11 w-11 flex items-center justify-center"
                handleClick={() => {
                  handleTournamentName().catch((e) => console.error(e));
                }}
              />
              <SmallButton
                btnTitle={<GrPowerReset className="h-6 w-6" />}
                btnClassNames="h-11 w-11 flex items-center justify-center"
                handleClick={() => {
                  setIsTournamentNameChanged(false);
                  setNewTournamentName(tournament?.tournament.name || "");
                }}
              />
            </>
          )}
        </div>
        <GroupDropdown
          handleGroupClick={addGroupToTournament}
          alreadyCreatedGroups={getKeys(teamsByGroup)}
        />
      </div>

      <AddNewTeam
        tournamentId={tournamentId}
        addNewTeamGroup={addNewTeamGroup}
        isAddNewTeamOpen={Boolean(addNewTeamGroup)}
        handleCancelClick={() => {
          setAddNewTeamGroup(null);
          refetchParticipants().catch((err) => console.error(err));
        }}
      />

      <div
        className="overflow-y-auto"
        style={
          windowSize.width && windowSize.width > 650
            ? { maxHeight: "calc(100vh - 17rem)" }
            : { maxHeight: "calc(100vh - 14rem)" }
        }
      >
        <GridLayout isGap minWith="350">
          <EditTournamentCard
            teamsMap={teamsByGroup}
            groupToSmall={groupToSmall}
            teamToDelete={teamToDelete}
            resetNameChange={resetNameChange}
            setTeamToDelete={setTeamToDelete}
            handleDeleteTeam={handleDeleteTeam}
            handleGroupChange={handleGroupChange}
            changedParticipantsIds={changedParticipantsIds}
            handleParticipantUpdate={handleParticipantUpdate}
            handleParticipantNameChange={handleParticipantNameChange}
            handleCancelDeleteTeam={() => {
              setTeamToDelete(null);
            }}
            handleStartAddTeam={(group) => {
              setAddNewTeamGroup((state) => (state === group ? null : group));
            }}
          />
        </GridLayout>
      </div>
      <div className="flex w-full justify-end">
        {isGroupsChanged && (
          <Button
            btnColor="outline"
            isDisabled={groupToSmall.length > 0}
            btnTitle={<span className="px-3 text-sm">Save changes</span>}
            onClick={() => {
              handleUpdateTeam(teamsByGroup).catch((e) =>
                console.error("Error updating team", e)
              );
              handleCloseModal();
            }}
          />
        )}
      </div>
    </ModalWrap>
  );
};

export default EditTournamentGroup;
