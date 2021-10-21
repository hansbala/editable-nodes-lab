import { INodeLinkMenuProps } from '.'
import { AnchorGateway } from '../../../anchors'
import { LinkGateway } from '../../../links'
import { NodeGateway } from '../../../nodes'
import { IAnchor, ILink } from '../../../types'

export const loadLinks = async (
  props: INodeLinkMenuProps,
  setNodeIdsForLinks: (nodeIds: string[][]) => void
) => {
  const { currentNode } = props

  const awaitLinks = async () => {
    const anchorsFromNode = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    let anchors: IAnchor[] = []
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      anchors = anchorsFromNode.payload
    }
    const linkPromises = []
    const linksArray: ILink[] = []
    const linksIdSet = new Set<string>()
    for (let i = 0; i < anchors.length; i++) {
      linkPromises.push(LinkGateway.getLinksByAnchorId(anchors[i].anchorId))
    }
    const values = await Promise.all(linkPromises)
    for (let i = 0; i < values.length; i++) {
      const currLink = values[i].payload
      if (currLink !== null) {
        for (let j = 0; j < currLink.length; j++) {
          if (!linksIdSet.has(currLink[j].linkId)) {
            linksArray.push(currLink[j])
            linksIdSet.add(currLink[j].linkId)
          }
        }
      }
    }
    await fetchNodeIds(linksArray)
    return linksArray
  }

  const fetchNodeIds = async (linkArray: ILink[]) => {
    const anchorPromises = []
    for (let i = 0; i < linkArray.length; i++) {
      anchorPromises.push(
        AnchorGateway.getAnchors([linkArray[i].anchor1Id, linkArray[i].anchor2Id])
      )
    }
    const anchorCombinationArray = await Promise.all(anchorPromises)
    const anchorArray: IAnchor[][] = []
    for (let i = 0; i < anchorCombinationArray.length; i++) {
      if (anchorCombinationArray[i].success) {
        anchorArray.push(anchorCombinationArray[i].payload ?? [])
      }
    }
    const nodePromises = []
    for (let i = 0; i < anchorArray.length; i++) {
      if (anchorCombinationArray[i].success) {
        nodePromises.push(
          NodeGateway.getNodes([anchorArray[i][0].nodeId, anchorArray[i][1].nodeId])
        )
      }
    }
    const nodeCombinationArray = await Promise.all(nodePromises)
    const nodeIdArray: string[][] = []
    for (let i = 0; i < nodeCombinationArray.length; i++) {
      if (nodeCombinationArray[i].success && nodeCombinationArray[i].payload) {
        const currentPayload = nodeCombinationArray[i].payload ?? []
        if (currentPayload.length === 2) {
          nodeIdArray.push([currentPayload[0].title, currentPayload[1].title])
        } else if (currentPayload.length === 1) {
          nodeIdArray.push([currentPayload[0].title, currentPayload[0].title])
        } else {
          nodeIdArray.push([linkArray[i].anchor1Id, linkArray[i].anchor2Id])
        }
      }
    }
    setNodeIdsForLinks(nodeIdArray)
  }

  return awaitLinks()
}

export const fetchNodeFromLink = async (props: INodeLinkMenuProps, link: ILink) => {
  const {
    currentNode,
    nodeIdsToNodesMap,
    setSelectedNode,
    setRefreshLinkList,
    refreshLinkList,
  } = props

  const firstAnchorId = link.anchor1Id
  const secondAnchorId = link.anchor2Id
  const firstAnchor = await AnchorGateway.getAnchor(firstAnchorId)
  const secondAnchor = await AnchorGateway.getAnchor(secondAnchorId)
  if (firstAnchor.payload !== null && secondAnchor.payload !== null) {
    const firstNode = nodeIdsToNodesMap[firstAnchor.payload.nodeId]
    const secondNode = nodeIdsToNodesMap[secondAnchor.payload.nodeId]
    if (firstNode?.nodeId === currentNode?.nodeId && secondNode?.nodeId) {
      setSelectedNode(secondNode)
      setRefreshLinkList(!refreshLinkList)
      return secondNode.nodeId
    } else if (firstNode?.nodeId) {
      setSelectedNode(firstNode)
      setRefreshLinkList(!refreshLinkList)
      return firstNode.nodeId
    }
  }
}

export const includesAnchorId = (
  anchorId: string,
  selectedAnchors: IAnchor[] | null
): boolean => {
  let doesInclude: boolean = false
  selectedAnchors?.forEach((anchor) => {
    if (anchor?.anchorId === anchorId) {
      doesInclude = true
    }
  })
  return doesInclude
}
