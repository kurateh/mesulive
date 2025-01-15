import { DiscountCheckbox } from "./DiscountCheckbox";
import { EventRadioGroup } from "./EventRadioGroup";
import { SafeguardButtonGroup } from "./SafeguardButtonGroup";
import { SimulationCountInput } from "./SimulationCountInput";
import { StarcatchButtonGroup } from "./StarcatchButtonGroup";

export const DetailSettingSectionContent = () => {
  return (
    <div className="flex flex-col gap-4">
      <SimulationCountInput />
      <SafeguardButtonGroup />
      <StarcatchButtonGroup />
      <EventRadioGroup />
      <DiscountCheckbox />
    </div>
  );
};
