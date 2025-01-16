import { Chip } from "@heroui/react";
import { type Metadata } from "next";

import { Notice } from "~/app/_components";
import { ScopeProvider } from "~/app/_components/providers";
import { cx } from "~/shared/style";
import { PageTitle } from "~/shared/ui";

import { PageContent } from "./_components/PageContent";
import { PotentialCalcScope } from "./_lib/scopes";

export const metadata: Metadata = {
  title: "메이플스토리 잠재능력 계산기",
  description: "메이플스토리 잠재능력 계산기",
  openGraph: {
    title: "메이플스토리 잠재능력 계산기",
    description: "메이플스토리 잠재능력 계산기",
  },
  keywords: ["메이플스토리", "잠재능력", "잠재", "큐브", "계산기", "시뮬"],
};

export default function Page() {
  return (
    <ScopeProvider scope={PotentialCalcScope}>
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <PageTitle endColorVar="var(--mesulive-warning-500)">
            잠재능력 기댓값 계산기
          </PageTitle>
          <Chip
            color="default"
            variant="flat"
            classNames={{ content: cx("font-medium") }}
          >
            확률 정보 업데이트: 2024.10.18
          </Chip>
        </div>
        <Notice />
        <PageContent />
      </div>
    </ScopeProvider>
  );
}
