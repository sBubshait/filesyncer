import FilesCard from "../components/FilesCard";
import { FileFolder } from "../types";
import { getSection } from "../lib/api";

export default async function Home() {
  const favouriteFiles: FileFolder[] = await getSection("favourites");
  return (
    <>
        <div className="p-4 sm:ml-64">
          <div className="mt-14"></div>
          <FilesCard title="Favourites" files={favouriteFiles} extended={true} />
          
        </div>
      </>
  );
}
