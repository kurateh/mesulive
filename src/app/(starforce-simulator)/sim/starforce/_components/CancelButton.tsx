import { cx } from "~/shared/style";
import { Button } from "~/shared/ui";

interface Props {
  className?: string;
}

export const CancelButton = ({ className }: Props) => {
  return (
    <Button
      className={cx("", className)}
      color="primary"
      size="lg"
      variant="flat"
    >
      계산 취소
    </Button>
  );
};
