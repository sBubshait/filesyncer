import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { sidebarItems } from "../../sidebar";
import FilesCard from "../../components/FilesCard";
import { FileFolder } from "../../types";
import { getFolder } from "../../api";

export default async function Home({
  params,
} : {
  params: {
    folderID: string;
  };
}) {
    const folder = await getFolder(params.folderID || "");
    
    return (
        <>
        <Navbar title="FileSyncer" />
            <Sidebar
              items={sidebarItems}
              storage={{ total: 20, used: 5 }}
              activeItem="Favourites"
            />
            <div className="p-4 sm:ml-64">
              <div className="mt-14"></div>
              <FilesCard title={folder.name} files={folder.files} extended={true} />
              
            </div>
          </>
    );
}
