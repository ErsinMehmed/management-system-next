import React from "react";
import { Card, Avatar } from "@heroui/react";

const UserInfo = ({ user }) => (
  <>
    <Card.Header className="flex gap-3 ml-3 mt-1">
      <Avatar className="ring-2 ring-primary rounded-md">
        <Avatar.Image src={user.user_profile_image} alt={user.user_name} />
        <Avatar.Fallback>{user.user_name?.charAt(0)?.toUpperCase()}</Avatar.Fallback>
      </Avatar>

      <div className="flex flex-col">
        <p className="text-md text-slate-700 font-semibold">{user.user_name}</p>
        <p className="text-small text-default-500">{user.user_role}</p>
      </div>
    </Card.Header>

    <hr className="border-default-200" />
  </>
);

export default UserInfo;
