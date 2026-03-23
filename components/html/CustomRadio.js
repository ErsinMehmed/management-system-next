import { Radio } from "@heroui/react";
import { cn } from "@heroui/react";

const CustomRadio = ({ value, children }) => {
  return (
    <Radio
      value={String(value)}
      className={cn(
        "group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse",
        "w-full cursor-pointer border-2 border-default rounded-lg gap-3 p-3",
        "data-[selected]:border-primary font-semibold"
      )}
    >
      {children}
    </Radio>
  );
};

export default CustomRadio;
