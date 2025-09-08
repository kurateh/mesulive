import { Image, Link } from "@heroui/react";
import { Equal } from "lucide-react";
import NextImage from "next/image";

import { Reboot } from "~/shared/assets/images";
import { cx } from "~/shared/style";

export const DeveloperProfile = async () => {
  return (
    <div>
      <p className="text-center text-sm font-bold text-default-500">제작자</p>
      <div className="flex items-center">
        <Link
          href="https://meaegi.com/s/%EC%BF%A0%EB%9D%BC%ED%85%8C"
          target="_blank"
          rel="noreferrer"
          className="flex-col text-sm"
          color="foreground"
        >
          <Image
            src="https://avatar.maplestory.nexon.com/Character/180/GDEOHJKMEGLKDLKHKOJOPKHHDPFLPGFHOBLLHPGOMEJBMOBPPMIKOJFPPNBPNLNMKIEKEKMFDKPCFFIMLMAOJEGLGCAKMIPKKJCBGFBEPAEONEIADBONEJGKPPPCKHEPIMCLMJAPNMAIAOGEMDKFDKLEHGBOONMNEBDBHDNJLGAFAGBCBIFENNBPILMEMADCGCMKAFOADABEGNIEKGANLEMHAPMPHJNGMDCCCLAHGJLFAPLMLAFGCBCDADPLNNPM.png"
            alt="제작자"
            classNames={{
              img: cx("pixelated mt-[-10px] object-none"),
              wrapper: cx("h-24 w-24"),
            }}
          />
          <div className="flex items-center">
            <p>쿠라테</p>
            <NextImage src={Reboot} alt="리부트" className="ml-1 mt-0.5" />
          </div>
        </Link>
        <Equal className="text-default-700" />
        <Link
          href="https://meaegi.com/s/%ED%85%8C%EC%82%B4%EB%A0%88"
          target="_blank"
          rel="noreferrer"
          className="flex-col overflow-hidden text-sm"
          color="foreground"
        >
          <Image
            src="https://avatar.maplestory.nexon.com/Character/180/DENJOECAEEBPMICICJLLIJMDGPKFAOJNOHMJBDIMJHLFCGBMNINEIFEGILFPLNLFHLGCHOFLHHEHDJPGLJEPADHEKCJJCPKHCACBMFEGBDMFOMPFOLGKLHHACFMJAIEINKPHOHDPMLFDFLPIAECMKGAOENNOLKJBAMPFNFEBKBBLEIEFJPDEOKLGIDHFLJKJHIEPDHOGGEKFAMDIBLNBECOFCHOOPFLBMGIPJPBLCIJFHLFCKECNBJOAGLNEMPMJ.png"
            alt="제작자"
            classNames={{
              img: cx("pixelated mt-[-10px] object-none"),
              wrapper: cx("h-24 w-24"),
            }}
          />
          <div className="flex items-center">
            <p>테살레</p>
            <Image
              src="https://ssl.nexon.com/s2/game/maplestory/renewal/common/world_icon/icon_23.png"
              alt="챌린저스"
              className="ml-1 mt-0.5"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};
