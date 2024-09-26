"use client";

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    Cookies.remove('token');

    router.push('/login');
  };

  return (
    <button
      type="button"
      className="flex font-semibold"
      onClick={handleSignOut}
    >
      <svg
        className="mr-1 size-6"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
        />
      </svg>
      Sign Out
    </button>
  );
}
