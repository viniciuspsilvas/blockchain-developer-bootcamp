import { FC } from "react";

interface HamburgerMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export const HamburgerMenu: FC<HamburgerMenuProps> = ({ isOpen, toggleMenu }) => {
  return (
    <button
      onClick={toggleMenu}
      className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-secondary rounded-lg border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-200"
    >
      <div className="relative w-6 h-6">
        <span
          className={`absolute top-0 left-0 w-6 h-0.5 bg-white transform transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2.5" : ""
          }`}
        />
        <span
          className={`absolute top-2.5 left-0 w-6 h-0.5 bg-white transform transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 w-6 h-0.5 bg-white transform transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2.5" : ""
          }`}
        />
      </div>
    </button>
  );
}; 