import MenuContainer from "components/containers/MenuContainer/MenuContainer";
import NewTournamentContainer from "components/containers/NewGameContainer/NewGameContainer";
import Logo from "components/elements/Logo/Logo";
import RoundLinkButton from "components/elements/RoundLinkButton/RoundLinkButton";
import SettingsDrawer from "components/elements/SettingsDrawer/SettingsDrawer";
import { ROUTES_WITHOUT_NAVBAR, ROUTES_WITH_MAIN_NAV } from "hardcoded";
import useRedirect from "hooks/useRedirect";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { api } from "utils/api";

const NavBar: FC = () => {
  const router = useRouter();
  const { getCurrentPath } = useRedirect();
  const [isUser, setIsUser] = useState(false);
  const { refetch } = api.users.getCurrentUser.useQuery(undefined, {
    retry: 0,
    onSuccess(data) {
      if (data.user) {
        setIsUser(true);
      }
    },
    onError() {
      setIsUser(false);
    },
  });

  const isSettingsDrawer = () => {
    const path = getCurrentPath();
    return path === "/tournaments" || path === "/tournaments/[tournamentsId]";
  };

  const isMainNavBar = () => {
    return ROUTES_WITH_MAIN_NAV.includes(router.pathname);
  };

  useEffect(() => {
    // if page changed, refetch user data
    router.events.on("routeChangeComplete", () => {
      refetch().catch((err) => {
        console.error(err);
      });
    });
  }, [refetch, router.events]);

  if (ROUTES_WITHOUT_NAVBAR.includes(router.pathname)) return null;

  return (
    <>
      <nav className="relative z-20 flex items-center justify-between bg-slate-50 px-4 py-4 shadow-[0_2px_5px_rgba(0,0,0,0.07)] md:px-12 md:py-4">
        {isMainNavBar() ? (
          <>
            <Logo />
            {isUser ? (
              <RoundLinkButton href="/tournaments" linkTitle="Tournaments" />
            ) : (
              <RoundLinkButton href="/login" linkTitle="Login" />
            )}
          </>
        ) : (
          <>
            <MenuContainer />
            <Logo />
            <div className="flex">
              <NewTournamentContainer />
            </div>
          </>
        )}
      </nav>
      {isSettingsDrawer() && <SettingsDrawer />}
    </>
  );
};

export default NavBar;
