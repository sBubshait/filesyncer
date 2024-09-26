import { DarkThemeToggle } from "flowbite-react";
import DashboardLayout from "./components/DashboardLayout";
import FilesCard from "./components/FilesCard";
import { FileFolder } from "./types";
import { getSection } from "./lib/api";

export default async function Home() {
  const recentFiles: FileFolder[] = await getSection("recent");

  return (
    <>
      <DashboardLayout title="FileSyncer" storage={{ total: 20, used: 5 }} />

      <div className="p-4 sm:ml-64">
        <div className="mt-14"></div>
        <FilesCard title="Quick Access" files={recentFiles} />
        <FilesCard title="Recent Files" files={recentFiles} />
      </div>
    </>
  );
}
