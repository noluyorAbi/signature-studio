import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { Square } from "./Square";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Promo" component={Promo} durationInFrames={600} fps={30} width={1920} height={1080} />
      <Composition id="Square" component={Square} durationInFrames={270} fps={30} width={1080} height={1080} />
    </>
  );
};
