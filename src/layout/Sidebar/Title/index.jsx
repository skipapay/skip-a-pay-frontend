import React from "react";
import config from "config/config";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const Title = () => {
  return (
    <div className="title">
      <div className="logo">
        <Cog6ToothIcon />
      </div>
      <div className="site-name">
        <h2>{config.siteName}</h2>
      </div>
    </div>
  );
};

export default Title;
