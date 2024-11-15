import FilesCard from "../../components/FilesCard";
import { FileFolder } from "../../types";
import { getFolder } from "../../lib/api";

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
            <div className="p-4 sm:ml-64">
              <div className="mt-14"></div>
              <FilesCard title={folder.name} files={folder.files} extended={true} allowUpload={true} uploadFolderID={params.folderID} />
              
            </div>
          </>
    );
}
