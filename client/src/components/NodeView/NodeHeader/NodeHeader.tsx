import { Select } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import * as bi from 'react-icons/bi'
import * as ri from 'react-icons/ri'
import { NodeGateway } from '../../../nodes'
import { IFolderNode, INode, INodeProperty, makeINodeProperty } from '../../../types'
import { Button } from '../../Button'
import { ContextMenuItems } from '../../ContextMenu'
import { EditableText } from '../../EditableText'
import './NodeHeader.scss'

interface INodeHeaderProps {
  onHandleCompleteLinkClick: () => void
  onHandleStartLinkClick: () => void
  currentNode: INode
  isLinking: boolean
  onDeleteButtonClick: (node: INode) => void
  onMoveButtonClick: (node: INode) => void
  setSelectedNode: (node: INode | null) => void
  setAlertIsOpen: (open: boolean) => void
  setAlertMessage: (message: string) => void
  setAlertTitle: (title: string) => void
  refreshLinkList: boolean
  setRefreshLinkList: (refreshLinkList: boolean) => void
}

export const NodeHeader = (props: INodeHeaderProps) => {
  const {
    currentNode,
    onDeleteButtonClick,
    onMoveButtonClick,
    isLinking,
    onHandleStartLinkClick,
    onHandleCompleteLinkClick,
    setSelectedNode,
    setAlertIsOpen,
    setAlertMessage,
    setAlertTitle,
    setRefreshLinkList,
    refreshLinkList,
  } = props

  // State variable for current node title
  const [title, setTitle] = useState(currentNode.title)
  // State variable for whether the title is being edited
  const [editingTitle, setEditingTitle] = useState<boolean>(false)

  /* Method to update the current folder view */
  const handleUpdateFolderView = async (e: React.ChangeEvent) => {
    const nodeProperty: INodeProperty = makeINodeProperty(
      'viewType',
      (e.currentTarget as any).value as any
    )
    const updateViewResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (updateViewResp.success) {
      setSelectedNode(updateViewResp.payload)
    } else {
      setAlertIsOpen(true)
      setAlertTitle('View not updated')
      setAlertMessage(updateViewResp.message)
    }
  }

  /* Method to update the node title */
  const handleUpdateTitle = async (title: string) => {
    setTitle(title)
    const nodeProperty: INodeProperty = makeINodeProperty('title', title)
    const titleUpdateResp = await NodeGateway.updateNode(currentNode.nodeId, [
      nodeProperty,
    ])
    if (!titleUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Title update failed')
      setAlertMessage(titleUpdateResp.message)
    }
    setRefreshLinkList(!refreshLinkList)
  }

  /* Method called on title right click */
  const handleTitleRightClick = () => {
    // TODO: Task 10 - context menu
    ContextMenuItems.splice(0, ContextMenuItems.length)
    const menuItem: JSX.Element = (
      <div
        key={'titleRename'}
        className="contextMenuItem"
        onClick={(e) => {
          ContextMenuItems.splice(0, ContextMenuItems.length)
          setEditingTitle(true)
        }}
      >
        <div className="itemTitle">Rename</div>
        <div className="itemShortcut">ctrl + shift + R</div>
      </div>
    )
    ContextMenuItems.push(menuItem)
  }

  /* useEffect which updates the title and editing state when the node is changed */
  useEffect(() => {
    setTitle(currentNode.title)
    setEditingTitle(false)
  }, [currentNode])

  /* Node key handlers*/
  const nodeKeyHandlers = (e: KeyboardEvent) => {
    // TODO: Task 10 - keyboard shortcuts
    switch (e.key) {
      case 'Enter':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
      case 'Escape':
        if (editingTitle == true) {
          e.preventDefault()
          setEditingTitle(false)
        }
        break
    }

    // ctrl + shift key events
    if (e.shiftKey && e.ctrlKey) {
      switch (e.key) {
        case 'R':
          e.preventDefault()
          setEditingTitle(true)
          break
      }
    }
  }

  // Trigger on node load or when editingTitle changes
  useEffect(() => {
    // TODO: Task 10 - keyboard shortcuts
    document.addEventListener('keydown', nodeKeyHandlers)
  }, [editingTitle])

  const folder: boolean = currentNode.type === 'folder'
  const notRoot: boolean = currentNode.nodeId !== 'root'
  return (
    <div className="nodeView-info">
      <div
        className="nodeView-title"
        onDoubleClick={(e) => setEditingTitle(true)}
        onContextMenu={handleTitleRightClick}
      >
        <EditableText
          text={title}
          editing={editingTitle}
          setEditing={setEditingTitle}
          onEdit={handleUpdateTitle}
        />
      </div>
      <div className="nodeView-buttonBar">
        {notRoot && (
          <>
            <Button
              icon={<ri.RiDeleteBin6Line />}
              text="Delete"
              onClick={() => onDeleteButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiDragDropLine />}
              text="Move"
              onClick={() => onMoveButtonClick(currentNode)}
            />
            <Button
              icon={<ri.RiExternalLinkLine />}
              text="Start Link"
              onClick={onHandleStartLinkClick}
            />
            {isLinking && (
              <Button
                text="Complete Link"
                icon={<bi.BiLinkAlt />}
                onClick={onHandleCompleteLinkClick}
              />
            )}
            {folder && (
              <div className="select">
                <Select
                  bg="f1f1f1"
                  defaultValue={(currentNode as IFolderNode).viewType}
                  onChange={handleUpdateFolderView}
                  height={35}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
