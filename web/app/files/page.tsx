import FilesCard from "../components/FilesCard";
import { FileFolder } from "../types";
import { getSection } from "../lib/api";

export default async function Home() {
  const homeFiles = (await getSection("home"));
  return (
    <>
        <div className="p-4 sm:ml-64">
          <div className="mt-14"></div>
          <FilesCard title="All Files" files={homeFiles} extended={true} />
          
        </div>
      </>
  );
}
