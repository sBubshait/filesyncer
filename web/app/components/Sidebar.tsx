import Link from "next/link";

export interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  tag: string | null;
}

export default function Sidebar({
  items,
  activeItem,
}: {
  items: SidebarItem[];
  activeItem: string;
}) {
  return (
    <aside
      id="logo-sidebar"
      className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-20 transition-transform sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800"
      aria-label="Sidebar"
    >
      <div className="h-full overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`group flex items-center rounded-lg p-2 text-gray-900 hover:bg-sky-50 ${
                  item.name === activeItem ? "bg-sky-50" : ""
                }`}
              >
                <div className={`size-5 ${item.name == activeItem ? "text-indigo-700" : "text-gray-500"} transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white`}>
                  {item.icon}
                </div>

                <span
                  className={`ms-3 font-semibold ${item.tag ? "flex-1 whitespace-nowrap" : ""} ${item.name === activeItem ? "text-indigo-700 dark:text-white" : ""} group-hover:text-indigo-700`}
                >
                  {item.name}
                </span>

                {item.tag && (
                  <span className="ms-3 inline-flex size-3 items-center justify-center rounded-full bg-blue-100 p-3 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {item.tag}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
