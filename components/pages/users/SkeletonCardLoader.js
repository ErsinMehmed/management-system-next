import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Skeleton,
} from "@nextui-org/react";

const SkeletonCardLoader = () => {
  return [...Array(4)].map((_, index) => (
    <Card key={index} className="w-full lg:max-w-[550px]">
      <CardHeader className="flex gap-3 ml-3 mt-1">
        <Skeleton className="flex rounded-lg w-11 h-11" />
        <div className="space-y-2.5">
          <Skeleton className="h-2.5 w-32 rounded-lg" />
          <Skeleton className="h-2.5 w-14 rounded-lg" />
        </div>
      </CardHeader>

      <Divider />

      <CardBody>
        <div className="p-3.5 space-y-[22px]">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center">
              <Skeleton className="flex rounded-full w-9 h-9" />
              <div className="space-y-2.5 ml-3">
                <Skeleton className="h-2.5 w-32 rounded-lg" />
                <Skeleton className="h-2.5 w-44 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  ));
};

export default SkeletonCardLoader;
