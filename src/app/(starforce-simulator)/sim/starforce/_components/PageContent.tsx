"use client";

import { SectionContainer } from "~/shared/ui";

import { CalculateButtons } from "./CalculateButtons";
import { DetailSettingSectionContent } from "./DetailSettingSectionContent";
import { EquipSettingSectionContent } from "./EquipSettingSectionContent";
import { ResultSectionContent } from "./ResultSectionContent";

export const PageContent = () => {
  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-col gap-4 lg:w-0 lg:flex-1">
        <SectionContainer title="장비 설정">
          <EquipSettingSectionContent />
        </SectionContainer>
        <SectionContainer title="세부 설정">
          <DetailSettingSectionContent />
        </SectionContainer>
        <CalculateButtons />
      </div>

      <div className="lg:min-h-full lg:w-0 lg:flex-1">
        <SectionContainer
          title={
            <>
              시뮬레이션 결과
              <p className="text-xs text-default-500">
                각 차트에선 하위 0.1%가 생략되어 있지만,
                <br />
                평균 및 상위 N% 구하기에는 포함되어 있습니다.
              </p>
            </>
          }
          className="lg:h-full"
        >
          <ResultSectionContent />
        </SectionContainer>
      </div>
    </div>
  );
};
