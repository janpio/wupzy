import { LINKS, PAGES_WITHOUT_HEADER } from "hardcoded";
import { useRouter } from "next/router";
import type { FC } from "react";
import Logo from "~/components/elements/Logo/Logo";
import DesktopNav from "~/components/elements/NavBar/DesktopNav";
import MobileNav from "~/components/elements/NavBar/MobileNav";
import SettingsDrawer from "~/components/elements/SettingsDrawer/SettingsDrawer";

const NavBar: FC = () => {
  const router = useRouter();

  const isNavBar = () => {
    return !PAGES_WITHOUT_HEADER.includes(router.pathname);
  };

  return (
    <>
      <nav className="relative z-[50] flex items-center justify-between bg-slate-50 px-4 py-4 shadow-[0_2px_5px_rgba(0,0,0,0.07)] md:px-12 md:py-4">
        <Logo />
        {isNavBar() && (
          <>
            <div className="hidden w-full lg:block">
              <DesktopNav links={LINKS} />
            </div>

            <div className="w-full lg:hidden">
              <MobileNav links={LINKS} />
            </div>
          </>
        )}
      </nav>
      {router.pathname === "/tournaments/[id]" && <SettingsDrawer />}
    </>
  );
};

export default NavBar;
