import React from "react";
import { CardHeader, Avatar, Divider } from "@heroui/react";

const UserInfo = ({ user }) => (
  <>
    <CardHeader className="flex gap-3 ml-3 mt-1">
      <Avatar isBordered radius="md" src={user.user_profile_image} />

      <div className="flex flex-col">
        <p className="text-md text-slate-700 font-semibold">{user.user_name}</p>

        <p className="text-small text-default-500">{user.user_role}</p>
      </div>
    </CardHeader>

    <Divider />
  </>
);

export default UserInfo;
