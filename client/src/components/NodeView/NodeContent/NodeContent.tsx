import React from 'react'
import { Extent, IAnchor, IFolderNode, INode } from '../../../types'
import { FolderContent } from './FolderContent'
import { ImageContent } from './ImageContent'
import './NodeContent.scss'
import { TextContent } from './TextContent'

/** Props needed to render any node content */

export interface INodeContentProps {
  childNodes?: INode[]
  currentNode: INode
  onCreateNodeButtonClick: () => void
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode) => void
  setSelectedExtent: (extent: Extent | null | undefined) => void
  selectedAnchors: IAnchor[] | null
  setSelectedAnchors: (anchor: IAnchor[]) => void
  refreshLinkList: boolean
  startAnchor: IAnchor | null
}

/**
 * This is the node content.
 *
 * @param props: INodeContentProps
 * @returns Content that any type of node renders
 */
export const NodeContent = (props: INodeContentProps) => {
  const {
    currentNode,
    setSelectedExtent,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    setSelectedNode,
    startAnchor,
    childNodes,
    selectedAnchors,
    setSelectedAnchors,
    refreshLinkList,
  } = props
  switch (currentNode.type) {
    case 'image':
      return <ImageContent {...props} />
    case 'text':
      return (
        <TextContent
          currentNode={currentNode}
          selectedAnchors={selectedAnchors}
          setSelectedAnchors={setSelectedAnchors}
          setSelectedExtent={setSelectedExtent}
          setSelectedNode={setSelectedNode}
          startAnchor={startAnchor}
          refreshLinkList={refreshLinkList}
        />
      )
    case 'folder':
      if (childNodes) {
        return (
          <FolderContent
            node={currentNode as IFolderNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            onMoveButtonClick={onMoveButtonClick}
            setSelectedExtent={setSelectedExtent}
            setSelectedNode={setSelectedNode}
            childNodes={childNodes}
          />
        )
      }
  }
  return null
}
