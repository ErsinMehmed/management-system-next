import React, { useEffect, useState, useMemo } from "react";
import Input from "@/components/html/Input";
import { userStore } from "@/stores/useStore";
import { observer } from "mobx-react-lite";
import userAction from "@/actions/userAction";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@nextui-org/react";
import { FaCheck } from "react-icons/fa6";

const UserInformation = (props) => {
  const { users, setUsers, loadUserSales } = userStore;
  const [loadingUsers, setLoadingUsers] = useState({});

  const handleUpdateUser = (userId, field, value) => {
    const updatedUsers = users.map((user) => {
      if (user._id === userId) {
        return { ...user, [field]: value };
      }

      return user;
    });

    setUsers(updatedUsers);
  };

  const handleUpdateUserInfo = async (userId) => {
    const userToUpdate = users.find((user) => user._id === userId);

    if (userToUpdate) {
      try {
        setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
        await userAction.updateUser(userId, userToUpdate);
        loadUserSales(props.period);
      } finally {
        await userAction.getUsers();
        setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  return (
    <div className="space-y-4 mt-2.5">
      <Table
        isStriped
        classNames={{
          table: "min-h-[200px]",
        }}
      >
        <TableHeader>
          <TableColumn>ПОТРЕБИТЕЛ</TableColumn>
          <TableColumn>ТАРГЕТ</TableColumn>
          <TableColumn>ПРОЦЕНТ</TableColumn>
          <TableColumn>ДЕЙСТВИЯ</TableColumn>
        </TableHeader>

        <TableBody>
          {users?.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.name}</TableCell>

              <TableCell>
                <Input
                  type="text"
                  label="Таргет"
                  value={user.target || ""}
                  disabled={loadingUsers[user._id]}
                  onChange={(value) =>
                    handleUpdateUser(user._id, "target", value)
                  }
                  inputWrapperClasses={
                    index % 2 !== 0 ? "bg-white focus-within:!bg-blue-50" : ""
                  }
                />
              </TableCell>

              <TableCell>
                <Input
                  type="text"
                  label="Процент"
                  value={user.percent || ""}
                  disabled={loadingUsers[user._id]}
                  onChange={(value) =>
                    handleUpdateUser(user._id, "percent", value)
                  }
                  inputWrapperClasses={
                    index % 2 !== 0 ? "bg-white focus-within:!bg-blue-50" : ""
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  onClick={() => handleUpdateUserInfo(user._id)}
                  isIconOnly
                  color="primary"
                  aria-label="Save"
                  isDisabled={loadingUsers[user._id]}
                >
                  <FaCheck className="size-5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default observer(UserInformation);
