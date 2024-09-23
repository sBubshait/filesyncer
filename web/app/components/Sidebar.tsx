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
  storage,
}: {
  items: { topItems: SidebarItem[]; bottomItems: SidebarItem[] };
  activeItem: string;
  storage: { total: number; used: number };
}) {
  return (
    <aside
      id="logo-sidebar"
      className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-20 transition-transform sm:translate-x-0 dark:border-gray-700 dark:bg-gray-800"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto bg-white px-3 pb-4 dark:bg-gray-800">
        {/* Top Section */}
        <ul className="space-y-2 font-medium">
          {items.topItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`group flex items-center rounded-lg p-2 text-gray-900 hover:bg-sky-50 ${
                  item.name === activeItem ? "bg-sky-50" : ""
                }`}
              >
                <div
                  className={`size-5 ${item.name == activeItem ? "text-indigo-700" : "text-gray-500"} transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white`}
                >
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

        <div>
          {/* Bottom Section */}
          <ul className="space-y-2 font-medium">
            {items.bottomItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-sky-50 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <div className="size-5 text-gray-500 transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white">
                    {item.icon}
                  </div>

                  <span className="ms-3 font-semibold group-hover:text-indigo-700">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-2 block max-w-sm rounded-lg border border-gray-200 bg-white p-2 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <div className="group flex items-center rounded-lg p-2 text-gray-900">
              <div className="size-5 text-gray-500 transition duration-75 group-hover:text-indigo-700 dark:text-gray-400 dark:group-hover:text-white">
                <svg
                  className="size-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
              </div>

              <span className="ms-3 font-semibold group-hover:text-indigo-700">
                Storage
              </span>
            </div>

            <div className="m-2 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: `${(storage.used / storage.total) * 100}%` }}
              />
            </div>
            
            <div className="m-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {storage.used} GB of {storage.total} GB used
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
}
