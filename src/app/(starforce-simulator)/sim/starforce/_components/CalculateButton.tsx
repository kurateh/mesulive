import { cx } from "~/shared/style";
import { Button } from "~/shared/ui";

interface Props {
  className?: string;
}

export const CalculateButton = ({ className }: Props) => {
  return (
    <Button className={cx("", className)} color="primary" size="lg">
      계산하기
    </Button>
  );
};
