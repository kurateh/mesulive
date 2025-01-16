import { Chip } from "@heroui/react";
import { type Metadata } from "next";

import { Notices } from "~/app/_components/Notices";
import { cx } from "~/shared/style";
import { PageTitle, SectionContainer } from "~/shared/ui";

import {
  ResultSectionContent,
  SettingSectionContent,
  StatEfficiencyModal,
  StatSimulationContent,
  StatSimulationModal,
} from "./_components";
import { BonusStatCalcProvider } from "./_lib";

export const metadata: Metadata = {
  title: "메이플스토리 추가옵션 계산기",
  description: "메이플스토리 추가옵션 계산기",
  openGraph: {
    title: "메이플스토리 추가옵션 계산기",
    description: "메이플스토리 추가옵션 계산기",
  },
  keywords: ["메이플스토리", "추가옵션", "계산기"],
};

export default function Page() {
  return (
    <BonusStatCalcProvider>
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <PageTitle endColorVar="var(--mesulive-secondary-500)">
            추가옵션 기댓값 계산기
          </PageTitle>
          <Chip
            color="default"
            variant="flat"
            classNames={{ content: cx("font-medium") }}
          >
            확률 정보 업데이트: 2024.07.29
          </Chip>
        </div>
        <Notices />

        <div className="mt-4 flex flex-col gap-4 lg:flex-row">
          <div className="flex w-full flex-col gap-4 lg:flex-1">
            <SectionContainer title="설정">
              <SettingSectionContent />
            </SectionContainer>
            <SectionContainer
              title="스탯 환산치 계산"
              className="hidden lg:block"
            >
              <StatSimulationContent />
            </SectionContainer>
          </div>
          <div className="w-full lg:flex-1">
            <SectionContainer title="계산 결과" className="w-full">
              <ResultSectionContent />
            </SectionContainer>
          </div>
        </div>
      </div>
      <StatEfficiencyModal />
      <StatSimulationModal />
    </BonusStatCalcProvider>
  );
}
