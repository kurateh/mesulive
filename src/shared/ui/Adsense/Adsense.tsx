import { cx } from "~/shared/style";

interface Props {
  className?: string;
  adSlot: string;
  adFormat?: string;
  IsFullWidthResponsive?: boolean;
}

export const Adsense = ({
  className,
  adSlot,
  adFormat,
  IsFullWidthResponsive,
}: Props) => {
  return (
    <>
      <ins
        className={cx(
          "adsbygoogle",
          process.env.NODE_ENV === "development" && "bg-default-200",
          className,
        )}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={IsFullWidthResponsive ? "true" : undefined}
        data-ad-test={process.env.NODE_ENV === "development" ? "on" : undefined}
      ></ins>
      <script>{"(adsbygoogle = window.adsbygoogle || []).push({});"}</script>
    </>
  );
};
