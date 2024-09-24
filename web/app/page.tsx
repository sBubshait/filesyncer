import { DarkThemeToggle } from "flowbite-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { sidebarItems } from "./sidebar";
import FilesCard from "./components/FilesCard";
import { FileFolder } from "./types";
import { getSection } from "./api";

export default async function Home() {
  const recentFiles: FileFolder[] = (await getSection("recent"));
  console.log(recentFiles)
  return (
    <>
    <Navbar title="FileSyncer" />
        <Sidebar
          items={sidebarItems}
          storage={{ total: 20, used: 5 }}
          activeItem="Home"
        />
        <div className="p-4 sm:ml-64">
          <div className="mt-14"></div>
          <FilesCard title="Quick Access" files={recentFiles} />
          <FilesCard title="Recent Files" files={recentFiles} />
          
        </div>
      </>
  );
}


// const recentFiles: FileFolder[] = [
//   {
//     fileID: "home/Education",
//     name: "Education",
//     type: "folder",
//     extension: "",
//     size: 0,
//     modifiedAt: "2021-09-01",
//   },
//   {
//     fileID: "home/Work",
//     name: "Work",
//     type: "folder",
//     extension: "",
//     size: 0,
//     modifiedAt: "2021-09-01",
//   },
//   {
//     fileID: "home/welcome.txt",
//     name: "welcome",
//     type: "file",
//     extension: "txt",
//     size: 1024,
//     modifiedAt: "2021-09-01",
//   },
//   {
//     fileID: "home/hello.pdf",
//     name: "hello",
//     type: "file",
//     extension: "pdf",
//     size: 1024,
//     modifiedAt: "2021-09-01",
//   },
// ];
