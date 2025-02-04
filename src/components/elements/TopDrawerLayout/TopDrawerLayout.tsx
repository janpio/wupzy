import { useRef, useState, type FC, type ReactNode } from "react";
import TabButton from "~/components/elements/TabButton/TabButton";
import useOnClickOutside from "~/hooks/useOnClickOutside";
import classNames from "~/utils/classNames";

interface TopDrawerLayoutProps {
  children: ReactNode;
}

const TopDrawerLayout: FC<TopDrawerLayoutProps> = ({ children }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useOnClickOutside<HTMLDivElement>(drawerRef, () => {
    setIsDrawerOpen(false);
  });

  return (
    <div className="relative" ref={drawerRef}>
      <div
        className={classNames(
          isDrawerOpen ? "translate-y-0 shadow-md" : "translate-y-[-100%]",
          "absolute left-0 right-0 top-0 z-[10] transition duration-300 ease-in-out"
        )}
      >
        {children}
        <div className="absolute -bottom-5 right-0 z-40 flex justify-end px-4 transition-all md:px-12 lg:right-[12.5rem]">
          <TabButton
            handleClick={() => {
              setIsDrawerOpen((state) => !state);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopDrawerLayout;
