"use client";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dropdown, Avatar } from "@heroui/react";
import { MdKeyboardArrowDown } from "react-icons/md";

const AccountDropdown = () => {
  const { data: session } = useSession();
  const router = useRouter();

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
        <Dropdown.Trigger>
          <div className="center-element cursor-pointer">
            <Avatar
              size="sm"
              className="transition-transform mr-2 sm:mr-0 ring-2 ring-white ring-offset-1"
            >
              <Avatar.Image src={session?.user.profile_image} alt={getUserFirstName()} />
              <Avatar.Fallback>{getUserFirstName()?.charAt(0)?.toUpperCase()}</Avatar.Fallback>
            </Avatar>

            <span className="ml-3.5 font-semibold hidden md:block">
              {getUserFirstName()}
            </span>

            <MdKeyboardArrowDown className="hidden md:block mt-0.5 text-gray-400 w-6 h-6" />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Popover>
          <Dropdown.Menu aria-label="User Actions">
            <Dropdown.Item key="my_data" id="my_data" textValue="Моите данни" onPress={() => router.push("/dashboard/profile")}>
              Моите данни
            </Dropdown.Item>
            <Dropdown.Item key="logout" id="logout" textValue="Изход" variant="danger" onPress={() => signOut()}>
              Изход
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
};

export default AccountDropdown;
