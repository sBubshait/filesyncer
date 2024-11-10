import { FileData, FolderData, FileFolderData } from './types.js'

// Definition of all operations that can be done with the database
import { GeneralOperations, FileOperations, FolderOperations } from './types.js'

// Definition of models that implement the operations
import { generalModel } from './models/general.model.js'
import { fileModel } from './models/file.model.js'
import { folderModel } from './models/folder.model.js'


export default {
    // General Operations at root level
    getOverview: generalModel.getOverview,
    getHomeFiles: generalModel.getHomeFiles,
    getRecentFiles: generalModel.getRecentFiles,
    getFavouriteFiles: generalModel.getFavouriteFiles,
    search: generalModel.search,
    
    // Namespaced Operations
    file: fileModel,
    folder: folderModel,
}