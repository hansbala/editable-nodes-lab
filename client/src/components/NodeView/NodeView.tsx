import React, { useCallback, useEffect, useState } from 'react'
import { AnchorGateway } from '../../anchors'
import { generateObjectId } from '../../global'
import { Extent, IAnchor, INode, isSameExtent, NodeIdsToNodesMap } from '../../types'
import { NodeBreadcrumb } from './NodeBreadcrumb'
import { NodeContent } from './NodeContent'
import { NodeHeader } from './NodeHeader'
import { NodeLinkMenu } from './NodeLinkMenu'
import './NodeView.scss'

export interface INodeViewProps {
  // for folder node content
  currentNode: INode
  // linking state
  isLinking: boolean
  // toggling linking state
  setIsLinking: (isLinking: boolean) => void
  // first anchor of link (anchor1)
  startAnchor: IAnchor | null
  // set anchor1 of link
  setStartAnchor: (anchor: IAnchor) => void
  // set anchor2 of link
  setEndAnchor: (anchor: IAnchor) => void
  // map of nodeIds to nodes
  nodeIdsToNodesMap: NodeIdsToNodesMap
  // handler for completing link
  onCompleteLinkClick: () => void
  // handler for opening create node modal
  onCreateNodeButtonClick: () => void
  // handler for deleting currentNode
  onDeleteButtonClick: (node: INode) => void
  // handler for opening move node modal
  onMoveButtonClick: (node: INode) => void
  // useEffect dependency for refreshing link list
  refreshLinkList: boolean
  // setter for refreshLinkList
  setRefreshLinkList: (refreshLinkList: boolean) => void
  // list of currently highlighted anchors
  selectedAnchors: IAnchor[] | null
  // currently selected Extent on node
  selectedExtent: Extent | null | undefined
  // setter for selectedExtent
  setSelectedExtent: (extent: Extent | null | undefined) => void
  // setter for selectedAnchors
  setSelectedAnchors: (anchor: IAnchor[]) => void
  // setter for selectedNode
  setSelectedNode: (node: INode | null) => void
  // children used when rendering folder node
  childNodes?: INode[]
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
}

/** Full page view focused on a node's content, with annotations and links */
export const NodeView = (props: INodeViewProps) => {
  const {
    currentNode,
    isLinking,
    setIsLinking,
    startAnchor,
    setStartAnchor,
    setEndAnchor,
    nodeIdsToNodesMap,
    onCompleteLinkClick,
    onCreateNodeButtonClick,
    onDeleteButtonClick,
    onMoveButtonClick,
    refreshLinkList,
    setRefreshLinkList,
    selectedAnchors,
    setSelectedExtent,
    selectedExtent,
    setSelectedAnchors,
    setSelectedNode,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
    childNodes,
  } = props

  const [anchors, setAnchors] = useState<IAnchor[]>([])
  const {
    filePath: { path },
  } = currentNode

  const loadAnchorsFromNodeId = useCallback(async () => {
    const anchorsFromNode = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      setAnchors(anchorsFromNode.payload)
    }
  }, [currentNode])

  const handleStartLinkClick = async () => {
    const anchorsByNodeResp = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    let anchor: IAnchor | undefined = undefined
    if (anchorsByNodeResp.success && selectedExtent) {
      anchorsByNodeResp.payload?.forEach((nodeAnchor) => {
        if (isSameExtent(nodeAnchor.extent, selectedExtent)) {
          anchor = nodeAnchor
        }
      })
    }
    if (selectedExtent === undefined) {
      setAlertIsOpen(true)
      setAlertTitle('Cannot start link from this anchor')
      setAlertMessage(
        // eslint-disable-next-line
        'There are overlapping anchors, or this anchor contains other anchors. Before you create this anchor you must remove the other anchors.'
      )
    } else {
      if (!anchor) {
        anchor = {
          anchorId: generateObjectId('anchor'),
          extent: selectedExtent,
          nodeId: currentNode.nodeId,
        }
      }
      setStartAnchor(anchor)
      setIsLinking(true)
    }
  }

  const handleCompleteLinkClick = () => {
    const anchor1 = startAnchor
    if (selectedExtent !== undefined && anchor1) {
      const anchor2 = {
        anchorId: generateObjectId('anchor'),
        extent: selectedExtent,
        nodeId: currentNode.nodeId,
      }
      setEndAnchor(anchor2)
      onCompleteLinkClick()
    }
  }

  useEffect(() => {
    loadAnchorsFromNodeId()
  }, [loadAnchorsFromNodeId, currentNode, refreshLinkList, setSelectedAnchors])

  const hasBreadcrumb: boolean = path.length > 1

  return (
    <div className="nodeView">
      {hasBreadcrumb && (
        <div className="nodeView-breadcrumb">
          <NodeBreadcrumb
            path={path}
            nodeIdsToNodesMap={nodeIdsToNodesMap}
            setSelected={setSelectedNode}
          />
        </div>
      )}
      <NodeHeader
        currentNode={currentNode}
        onMoveButtonClick={onMoveButtonClick}
        isLinking={isLinking}
        onDeleteButtonClick={onDeleteButtonClick}
        onHandleStartLinkClick={handleStartLinkClick}
        onHandleCompleteLinkClick={handleCompleteLinkClick}
        setSelectedNode={setSelectedNode}
        setAlertIsOpen={setAlertIsOpen}
        setAlertMessage={setAlertMessage}
        setAlertTitle={setAlertTitle}
        refreshLinkList={refreshLinkList}
        setRefreshLinkList={setRefreshLinkList}
      />
      <div className="nodeMain-content">
        <div
          className="nodeView-content"
          style={{
            maxHeight: hasBreadcrumb ? 'calc(100% - 118px)' : 'calc(100% - 72px)',
          }}
        >
          <NodeContent
            selectedAnchors={selectedAnchors}
            setSelectedAnchors={setSelectedAnchors}
            refreshLinkList={refreshLinkList}
            setSelectedExtent={setSelectedExtent}
            startAnchor={startAnchor}
            childNodes={childNodes}
            currentNode={currentNode}
            onCreateNodeButtonClick={onCreateNodeButtonClick}
            onDeleteButtonClick={onDeleteButtonClick}
            setSelectedNode={setSelectedNode}
            onMoveButtonClick={onMoveButtonClick}
          />
          {anchors.length > 0 && (
            <NodeLinkMenu
              currentNode={currentNode}
              setSelectedNode={setSelectedNode}
              setSelectedAnchors={setSelectedAnchors}
              selectedAnchors={selectedAnchors}
              nodeIdsToNodesMap={nodeIdsToNodesMap}
              setRefreshLinkList={setRefreshLinkList}
              refreshLinkList={refreshLinkList}
            />
          )}
        </div>
      </div>
    </div>
  )
}
