import { Chip } from "@heroui/react";
import { type Metadata } from "next";

import { Notice } from "~/app/_components";
import { ScopeProvider } from "~/app/_components/providers";
import { cx } from "~/shared/style";
import { PageTitle } from "~/shared/ui";

import { PageContent } from "./_components/PageContent";
import { StarforceSimulatorScope } from "./_lib/molecule";

export const metadata: Metadata = {
  title: "메이플스토리 스타포스 시뮬레이터",
  description: "메이플스토리 스타포스 시뮬레이터",
  openGraph: {
    title: "메이플스토리 스타포스 시뮬레이터",
    description: "메이플스토리 스타포스 시뮬레이터",
  },
  keywords: ["메이플스토리", "스타포스", "계산기", "시뮬"],
};

export default function Page() {
  return (
    <ScopeProvider scope={StarforceSimulatorScope}>
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <PageTitle endColorVar="var(--mesulive-primary)">
            스타포스 시뮬레이터
          </PageTitle>
          <Chip
            color="default"
            variant="flat"
            classNames={{ content: cx("font-medium") }}
          >
            로직 업데이트: 2024.01.25
          </Chip>
        </div>
        <Notice />
        <PageContent />
      </div>
    </ScopeProvider>
  );
}
