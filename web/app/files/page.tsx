import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { sidebarItems } from "../sidebar";
import FilesCard from "../components/FilesCard";
import { FileFolder } from "../types";
import { getSection } from "../api";

export default async function Home() {
  const homeFiles = (await getSection("home"));
  return (
    <>
    <Navbar title="FileSyncer" />
        <Sidebar
          items={sidebarItems}
          storage={{ total: 20, used: 5 }}
          activeItem="All Files"
        />
        <div className="p-4 sm:ml-64">
          <div className="mt-14"></div>
          <FilesCard title="All Files" files={homeFiles} extended={true} />
          
        </div>
      </>
  );
}
