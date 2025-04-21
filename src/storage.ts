import localforage from "localforage"

export const getFolderPath = () => localforage.getItem<string>("folderPath")
export const setFolderPath = (path: string) => localforage.setItem("folderPath", path)