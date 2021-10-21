import React from 'react'
import { Extent, IAnchor, INode } from '../../../../types'
import './TextContent.scss'
import { TextMenu } from './TextMenu'

/* You do not need to worry about these props, we
are keeping them here fore later use!*/
interface ITextContentProps {
  // for folder node content
  currentNode: INode
  // useEffect dependency for refreshing link list
  refreshLinkList: boolean
  // list of currently highlighted anchors
  selectedAnchors: IAnchor[] | null
  // setter for selectedAnchors
  setSelectedAnchors: (anchor: IAnchor[]) => void
  // setter for selectedExtent
  setSelectedExtent: (extent: Extent | null | undefined) => void
  // setter for selectedNode
  setSelectedNode: (node: INode) => void
  // to indicate the anchor that we are linking from
  startAnchor: IAnchor | null
}

/** The content of an text node, including all its anchors */
export const TextContent = (props: ITextContentProps) => {
  // destructuring props array
  const { currentNode } = props

  // TODO: Task 4, Task 5 & Task 7

  return <div className="textContent-wrapper">{currentNode.content}</div>
}
