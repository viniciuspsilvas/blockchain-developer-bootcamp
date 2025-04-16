import { FC } from "react";

interface BannerProps {
  text?: string;
}

export const Banner: FC<BannerProps> = ({ text }) => {
  return (
    <div className={` flex items-center justify-center h-full`}>
      <h1 >{text}</h1>
    </div>
  );
};
