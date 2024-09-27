import FilesCard from "../components/FilesCard";
import { FileFolder } from "../types";
import { getSection } from "../lib/api";


export default async function Home() {
  const recentFiles = await getSection("recent");

  return (
    <>
        <div className="p-4 sm:ml-64">
          <div className="mt-14"></div>
          <FilesCard title="Recent" files={recentFiles} extended={true} />
          
        </div>
      </>
  );
}


const recentFiles: FileFolder[] = [];