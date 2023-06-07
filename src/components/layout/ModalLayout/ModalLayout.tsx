import { useRef, type FC, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";
import useDelayUnmount from "~/hooks/useDelayUnmount";
import useOnClickOutside from "~/hooks/useOnClickOutside";
import classNames from "~/utils/classNames";

interface ModalLayoutProps {
  footer?: ReactNode;
  modalTitle?: string;
  children: ReactNode;
  isFullScreen?: boolean;
  isModalVisible: boolean;
  handleCancelClick: () => void;
}

const ModalLayout: FC<ModalLayoutProps> = ({
  footer,
  children,
  modalTitle,
  isFullScreen,
  isModalVisible,
  handleCancelClick,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { shouldRender, isAnimation } = useDelayUnmount(isModalVisible, 100);
  useOnClickOutside<HTMLDivElement>(modalRef, () => {
    handleCancelClick();
  });

  return (
    <>
      {shouldRender && (
        <div
          id="menu"
          className={classNames(
            isAnimation ? "opacity-100" : "opacity-0",
            "sticky-0 fixed inset-0 z-[100] flex h-full w-full items-center justify-center bg-gray-900 bg-opacity-80 transition-all duration-300 ease-in-out"
          )}
        >
          <div className="relative h-full w-full">
            <div
              className={classNames(
                !isFullScreen && "p-3",
                "absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform md:p-10"
              )}
            >
              <div
                ref={modalRef}
                className="flex h-full w-full flex-col justify-between rounded bg-white"
              >
                <div className="relative flex items-center justify-between px-3 py-2 pb-2 text-left shadow-lg md:px-6 md:py-4">
                  <div className={classNames()}>
                    {modalTitle && (
                      <div className="flex">
                        <p className="font-secondary text-2xl font-bold">
                          {modalTitle}
                        </p>
                      </div>
                    )}
                    <button
                      className="cursor-pointer"
                      onClick={handleCancelClick}
                    >
                      <IoClose className="absolute right-2 top-2 h-8 w-9 text-gray-800 hover:text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="h-full overflow-y-auto">{children}</div>
                {footer && <div>{footer}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalLayout;
