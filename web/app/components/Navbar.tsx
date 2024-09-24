// Navbar component

import SignOutButton from "./SignOutButton";

export default function Navbar({title, showSignOut = true} : {title: string, showSignOut? : boolean}) {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="size-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <div className="ms-2 flex md:me-24">
                <span className="self-center whitespace-nowrap text-xl font-bold sm:text-2xl dark:text-white">
                    {title}
                </span>
              </div>
            </div>
            {showSignOut && (
            <div className="flex items-center">
              <div className="ms-3 flex items-center">
                <div className="text-gray-800 hover:text-indigo-700 dark:text-gray-400 dark:hover:text-white">
                  <SignOutButton />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </nav>
    )
};