"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardLinks } from "@/data";

const MobileMenu = (props) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed block sm:hidden top-[65px] left-0 z-40 ${
        props.show ? "w-full" : "w-0"
      } transition-all duration-500 h-screen sm:translate-x-0 bg-gradient-to-r from-[#534bed] via-[#4d44ef] to-[#4b43e7]`}>
      <div className='h-full px-3 py-4 overflow-y-auto'>
        <ul className={`${!props.show && "hidden"} space-y-2 font-medium`}>
          {dashboardLinks.map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className={`flex items-center justify-center p-2 text-white rounded-lg font-semibold ${
                  pathname === item.link && "bg-[#4338ca]"
                } hover:bg-[#4338ca] group`}>
                {item.icon}

                <span className='ml-3'>{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default MobileMenu;
