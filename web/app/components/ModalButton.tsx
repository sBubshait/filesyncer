import Link from "next/link";

export default function ModalButton({
    icon,
    text,
    href,
    action,
  }: {
    icon: JSX.Element;
    text: string;
    href?: string;
    action?: () => void;
  }) {
    return href ? (
      <Link
        className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 p-4 py-6 dark:border-gray-700"
        href={href}
      >
        <div className="size-8">{icon}</div>
        <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {text}
        </span>
      </Link>
    ) : (
      <button
        onClick={action}
        className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-200 p-4 py-6 focus:outline-none dark:border-gray-700"
      >
        <div className="size-8">{icon}</div>
        <span className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {text}
        </span>
      </button>
    );
  }
  