export interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  tag: string | null;
}

export interface FileFolder {
    fileID: string;
    type: "file" | "folder";
    name: string;
    extension: string;
    size: number;
    modifiedAt: string;
}