"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { MdKeyboardArrowDown } from "react-icons/md";

const AccountDropdown = () => {
  const { data: session } = useSession();

  const getUserFirstName = () => {
    let firstName = session?.user.name.split(" ")[0];
    const lastChar = firstName?.charAt(firstName.length - 1);

    if (lastChar === "," || lastChar === "-") {
      firstName = firstName.slice(0, -1);
    }

    return firstName;
  };

  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <div className="flex items-center justify-center cursor-pointer">
            <Avatar
              isBordered
              size="sm"
              as="button"
              className="transition-transform mr-2 sm:mr-0"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            />

            <span className="ml-3.5 font-semibold hidden md:block">
              {getUserFirstName()}
            </span>

            <MdKeyboardArrowDown className="hidden md:block mt-0.5 text-gray-400 w-6 h-6" />
          </div>
        </DropdownTrigger>

        <DropdownMenu aria-label="User Actions" variant="flat">
          <DropdownItem key="my_data">Моите данни</DropdownItem>
          <DropdownItem onPress={() => signOut()} key="logout" color="danger">
            Изход
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default AccountDropdown;
