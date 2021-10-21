import {
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { BiLinkAlt } from 'react-icons/bi'
import { AnchorGateway } from '../../../anchors'
import { IAnchor, NodeIdsToNodesMap } from '../../../types'
import { Button } from '../../Button'
import './CompleteLinkModal.scss'
import { completestartAnchorModal } from './completeLinkUtils'

export interface ICompleteLinkModalProps {
  isOpen: boolean
  startAnchor: IAnchor | null
  endAnchor: IAnchor | null
  nodeIdsToNodes: NodeIdsToNodesMap
  onClose: () => void
  refreshLinkList: boolean
  setIsLinking: (isLinking: boolean) => void
  setRefreshLinkList: (refreshLinkList: boolean) => void
  setSelectedAnchors: (anchors: IAnchor[]) => void
  setStartAnchor: (startAnchor: IAnchor | null) => void
}

/**
 * Modal for adding a new node; lets the user choose a title, type,
 * and parent node
 */
export const CompleteLinkModal = (props: ICompleteLinkModalProps) => {
  const {
    isOpen,
    onClose,
    startAnchor,
    endAnchor,
    setSelectedAnchors,
    setIsLinking,
    setStartAnchor,
    refreshLinkList,
    setRefreshLinkList,
    nodeIdsToNodes,
  } = props
  // State variables
  const [title, setTitle] = useState('')
  const [explainer, setExplainer] = useState('')
  const [error, setError] = useState<string>('')

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleExplainerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExplainer(event.target.value)
  }

  // Called when the "Submit" button is clicked
  const handleSubmit = async () => {
    // create link from modal
    if (startAnchor && endAnchor) {
      let link = null
      const anchor1 = await AnchorGateway.createAnchor(startAnchor)
      const anchor2 = await AnchorGateway.createAnchor(endAnchor)
      if (anchor1.success && anchor2.success) {
        const anchor1Id = startAnchor.anchorId
        const anchor2Id = endAnchor.anchorId
        const attributes = {
          anchor1Id,
          anchor2Id,
          explainer,
          title,
        }
        link = await completestartAnchorModal(attributes)
        anchor2.payload && setSelectedAnchors([anchor2.payload])
      } else {
        setError('Error: Failed to create anchors')
        return
      }
      if (link !== null) {
        handleClose()
        setIsLinking(false)
        setStartAnchor(null)
        setRefreshLinkList(!refreshLinkList)
      } else {
        setError('Error: Failed to create link')
      }
    } else {
      setError('Error: Anchor 1 or 2 is missing')
    }
  }

  /** Reset all our state variables and close the modal */
  const handleClose = () => {
    onClose()
    setTitle('')
    setExplainer('')
    setError('')
  }

  const fromNodeId = startAnchor?.nodeId
  const toNodeId = endAnchor?.nodeId
  const nodeFromTitle = fromNodeId ? nodeIdsToNodes[fromNodeId].title : 'node'
  const nodeToTitle = toNodeId ? nodeIdsToNodes[toNodeId].title : 'node'

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-font">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div>
              Creating a bidirectional link from <b>{nodeFromTitle}</b> to
              <b> {nodeToTitle}</b>
            </div>
            <FormControl mt={4}>
              <FormLabel>Link Title</FormLabel>
              <Input value={title} onChange={handleTitleChange} placeholder="Title..." />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Link Explainer</FormLabel>
              <Textarea
                value={explainer}
                onChange={handleExplainerChange}
                placeholder="Explainer..."
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {error.length > 0 && <div className="modal-error">{error}</div>}
            <div className="modal-footer-buttons">
              <Button text="Create" icon={<BiLinkAlt />} onClick={handleSubmit} />
            </div>
          </ModalFooter>
        </ModalContent>
      </div>
    </Modal>
  )
}
