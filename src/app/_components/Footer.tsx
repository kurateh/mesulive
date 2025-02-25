import { Link } from "@heroui/react";

import { GithubMark } from "~/shared/assets/images";
import { Button } from "~/shared/ui";

export const Footer = () => {
  return (
    <footer className="mx-auto my-14 flex flex-col items-center gap-3">
      <Button
        size="lg"
        color="primary"
        className="font-semibold"
        as={Link}
        href="https://open.kakao.com/me/kurate"
        target="_blank"
        rel="noreferrer"
      >
        제작자에게 커피 사주기
      </Button>

      <Link target="_blank" href="https://github.com/kurateh/mesulive">
        <GithubMark className="size-10 fill-gray-600" />
      </Link>
      <p className="text-center text-sm text-default-400">
        Copyright 2022~ mesulive All rights reserved.
        <br />
        mesulive is not associated with NEXON Korea.
        <br />
        Contact: me@kurateh.com
      </p>
    </footer>
  );
};
