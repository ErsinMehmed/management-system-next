import { Progress } from "@heroui/react";

const LinearLoader = (props) => {
  return (
    props.show && (
      <div className='fixed top-0 left-0 z-50 w-full'>
        <Progress
          isIndeterminate
          aria-label='Loading...'
          classNames={{
            base: "w-full h-1.5",
            indicator: "bg-[#0071f5]",
          }}
        />
      </div>
    )
  );
};

export default LinearLoader;
