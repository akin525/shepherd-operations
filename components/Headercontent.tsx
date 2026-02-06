import React from "react";
interface HeadContentProp {
  title?: string;
  subTitle?: string;
  description?: string;
}
const Headercontent: React.FC<HeadContentProp> = ({
  title = "",
  subTitle = "",
  description = "",
}) => {
  return (
    <div>
      <div className="text-[22px] lg:text-[24px] flex items-center gap-2 font-medium">
        <h1 className="text-[#979797]">{title}</h1>
        {subTitle && (
          <span className="text-[#3A3A3A] dark:text-white">{subTitle}</span>
        )}
      </div>
      {description && (
        <p className="text-[#979797] hidden lg:inline text-[14px]">
          {description}
        </p>
      )}
    </div>
  );
};

export default Headercontent;
