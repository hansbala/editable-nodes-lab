import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ri from 'react-icons/ri'
import { useHistory } from 'react-router-dom'
import { AnchorGateway } from '../../../anchors'
import { LinkGateway } from '../../../links'
import { IAnchor, ILink, INode, NodeIdsToNodesMap } from '../../../types'
import { Button } from '../../Button'
import { PopoverMenu } from '../../Popover'
import './NodeLinkMenu.scss'
import { fetchNodeFromLink, includesAnchorId, loadLinks } from './nodeLinkMenuUtils'

export interface INodeLinkMenuProps {
  currentNode: INode
  nodeIdsToNodesMap: NodeIdsToNodesMap
  refreshLinkList: boolean
  selectedAnchors: IAnchor[] | null
  setRefreshLinkList: (refreshLinkList: boolean) => void
  setSelectedAnchors: (anchor: IAnchor[]) => void
  setSelectedNode: (node: INode | null) => void
}

export const NodeLinkMenu = (props: INodeLinkMenuProps) => {
  const {
    currentNode,
    selectedAnchors,
    setSelectedAnchors,
    setRefreshLinkList,
    refreshLinkList,
  } = props
  const [links, setLinks] = useState<ILink[]>([])
  const [nodeIdsForLinks, setNodeIdsForLinks] = useState<string[][]>([])

  const history = useHistory()

  useEffect(() => {
    const fetchLinks = async () => {
      setLinks(await loadLinks({ ...props }, setNodeIdsForLinks))
    }
    fetchLinks()
  }, [currentNode, refreshLinkList, selectedAnchors])

  const handleLinkDelete = async (link: ILink) => {
    const deleteAnchor1Response = await AnchorGateway.deleteAnchor(link.anchor1Id)
    const deleteAnchor2Response = await AnchorGateway.deleteAnchor(link.anchor2Id)
    const deleteLinkResponse = await LinkGateway.deleteLink(link.linkId)
    if (
      deleteAnchor1Response.success &&
      deleteAnchor2Response.success &&
      deleteLinkResponse.success
    ) {
      setRefreshLinkList(!refreshLinkList)
      setSelectedAnchors([])
    }
  }

  const handleLinkSelect = async (e: React.MouseEvent, link: ILink) => {
    const anchors: IAnchor[] = []
    const firstAnchorResp = await AnchorGateway.getAnchor(link.anchor1Id)
    const secondAnchorResp = await AnchorGateway.getAnchor(link.anchor2Id)
    if (firstAnchorResp.success && firstAnchorResp.payload) {
      const firstAnchor: IAnchor = firstAnchorResp.payload
      anchors.push(firstAnchor)
    }
    if (secondAnchorResp.success && secondAnchorResp.payload) {
      const secondAnchor: IAnchor = secondAnchorResp.payload
      anchors.push(secondAnchor)
    }
    switch (e.detail) {
      // Set selected anchors
      case 1:
        setSelectedAnchors(anchors)
        break
      // Navigate to other end of anchor
      case 2:
        const nodeId = await fetchNodeFromLink({ ...props }, link)
        history.push(`/${nodeId}`)
        console.log(anchors)
        setSelectedAnchors(anchors)
        break
    }
  }

  return (
    <div className="linkMenu">
      {links.map((link, index) => {
        const isAnchorSelected: boolean =
          includesAnchorId(link.anchor1Id, selectedAnchors) ||
          includesAnchorId(link.anchor2Id, selectedAnchors)
        return (
          <div
            className="linkItem"
            key={link.linkId}
            onClick={(e) => {
              handleLinkSelect(e, link)
            }}
            style={{
              backgroundColor: isAnchorSelected ? '#d7ecff' : undefined,
            }}
          >
            <div>
              <div className="anchorRelation">
                {nodeIdsForLinks && nodeIdsForLinks[index]
                  ? `${nodeIdsForLinks[index][0]} <-> ${nodeIdsForLinks[index][1]}`
                  : `${link.anchor1Id} <-> ${link.anchor2Id}`}
              </div>
              <div className="linkTitle">{link.title}</div>
              <div className="linkExplainer">{link.explainer}</div>
            </div>
            <div
              className="moreInfo"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <PopoverMenu
                trigger={
                  <div className="popoverTrigger">
                    <bi.BiDotsVerticalRounded />
                  </div>
                }
                content={
                  <Button
                    icon={<ri.RiDeleteBin6Line />}
                    text="Delete"
                    onClick={() => handleLinkDelete(link)}
                    style={{ width: '100%' }}
                  />
                }
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
