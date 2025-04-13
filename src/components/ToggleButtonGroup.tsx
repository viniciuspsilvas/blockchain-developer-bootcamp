import React from "react";

interface ToggleButtonGroupProps {
  options: string[];
  activeOption: string;
  onOptionClick: (option: string) => void;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  options,
  activeOption,
  onOptionClick,
  className = "bg-primary rounded-md p-1 flex space-x-2",
  activeClassName = "bg-blue",
  inactiveClassName = "",
}) => {
  return (
    <div className={className}>
      {options.map((option) => (
        <button
          key={option}
          className={`px-4 py-1 text-white rounded-md ${
            activeOption === option ? activeClassName : inactiveClassName
          }`}
          onClick={() => onOptionClick(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToggleButtonGroup; 