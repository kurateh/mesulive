"use client";

import { SectionContainer } from "~/shared/ui";

import { CalculateButtons } from "./CalculateButtons";
import { DetailSettingSectionContent } from "./DetailSettingSectionContent";
import { EquipSettingSectionContent } from "./EquipSettingSectionContent";

export const PageContent = () => {
  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-col gap-4 lg:flex-1">
        <SectionContainer title="장비 설정">
          <EquipSettingSectionContent />
        </SectionContainer>
        <SectionContainer title="세부 설정">
          <DetailSettingSectionContent />
        </SectionContainer>
        <CalculateButtons />
      </div>
      <div className="lg:min-h-full lg:flex-1">
        <SectionContainer
          title="시뮬레이션 결과"
          className="lg:h-full"
        ></SectionContainer>
      </div>
    </div>
  );
};
