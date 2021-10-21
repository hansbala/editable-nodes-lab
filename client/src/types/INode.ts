import { IFilePath, makeIFilePath } from './IFilePath'

// nodeTypes returns a string array of the types available
export const nodeTypes: string[] = ['text', 'image', 'folder']

// Supported nodeTypes for file browser
export type NodeType = 'text' | 'image' | 'folder' | 'pdf' | 'audio' | 'video'

// INode with node metadata
export interface INode {
  // type of node that is created
  content: any
  // the location properties of the node (file path)
  dateCreated?: Date
  // unique randomly generated ID which contains the type as a prefix
  filePath: IFilePath // the content of the node
  nodeId: string
  title: string
  // user create node title
  type: NodeType // date that the node was created
}

export type FolderContentType = 'list' | 'grid'

export interface IFolderNode extends INode {
  viewType: FolderContentType
}

export type NodeFields = keyof INode | keyof IFolderNode

// Type declaration for map from nodeId --> INode
export type NodeIdsToNodesMap = { [nodeId: string]: INode }

/**
 * Function that creates an INode given relevant inputs
 * @param nodeId
 * @param path
 * @param children
 * @param type
 * @param title
 * @param content
 * @returns INode object
 */
export function makeINode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any
): INode {
  return {
    content: content ?? 'content' + nodeId,
    filePath: makeIFilePath(path, children),
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type ?? 'text',
  }
}

export function makeIFolderNode(
  nodeId: any,
  path: any,
  children?: any,
  type?: any,
  title?: any,
  content?: any,
  viewType?: any
): IFolderNode {
  return {
    content: content ?? 'content' + nodeId,
    filePath: makeIFilePath(path, children),
    nodeId: nodeId,
    title: title ?? 'node' + nodeId,
    type: type ?? 'text',
    viewType: viewType ?? 'grid',
  }
}
