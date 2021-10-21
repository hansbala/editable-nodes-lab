import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as ri from 'react-icons/ri'
import { AnchorGateway } from '../../../../anchors'
import { NodeGateway } from '../../../../nodes'
import { Extent, IAnchor, IImageExtent, INode } from '../../../../types'
import './ImageContent.scss'

interface IImageContentProps {
  currentNode: INode
  selectedAnchors: IAnchor[] | null
  setSelectedExtent: (extent: Extent | null) => void
  setSelectedAnchors: (anchor: IAnchor[]) => void // setter for selectedAnchors
  setSelectedNode: (node: INode) => void // setter for selectedNode
  refreshLinkList: boolean
  startAnchor: IAnchor | null
}

/** The content of an image node, including any anchors */
export const ImageContent = (props: IImageContentProps) => {
  const {
    currentNode,
    selectedAnchors,
    setSelectedExtent,
    setSelectedAnchors,
    setSelectedNode,
    refreshLinkList,
    startAnchor,
  } = props

  const { content } = currentNode

  // Use state to keep track of anchors rendered on image
  const [imageAnchors, setImageAnchors] = useState<JSX.Element[]>([])

  let dragging: boolean = false // Indicated whether we are currently dragging the image
  let currentTop: number // To store the top of the currently selected region for onMove
  let currentLeft: number // To store the left of the currently selected region for onMove
  let xLast: number
  let yLast: number

  /**
   * useRef EXAMPLE: Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   */
  const imageContainer = useRef<HTMLHeadingElement>(null)
  const selection = useRef<HTMLHeadingElement>(null)
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([])

  const handleAnchorSelect = async (e: React.MouseEvent, anchor: IAnchor) => {
    e.stopPropagation()
    e.preventDefault()
    switch (e.detail) {
      // Left click to set selected anchors
      case 1:
        setSelectedAnchors && setSelectedAnchors([anchor])
        setSelectedExtent(anchor.extent)
        break
      // Double click to navigate to node
      case 2:
        const nodeResponse = await NodeGateway.getNode(anchor.nodeId)
        if (nodeResponse.success && nodeResponse.payload != null) {
          setSelectedNode(nodeResponse.payload)
        }
        break
    }
  }

  /**
   * This method displays the existing anchors.
   * Normally we would fetch these from the database, but for the simplicity
   * of this lab we are randomly generating them in the `imageAnchors.ts` file in the
   * `ImageContent` folder.
   */
  const displayImageAnchors = useCallback(async () => {
    let imageAnchors: IAnchor[]
    const anchorsFromNode = await AnchorGateway.getAnchorsByNodeId(currentNode.nodeId)
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      const anchorElementList: JSX.Element[] = []
      imageAnchors = anchorsFromNode.payload
      imageAnchors.forEach((anchor) => {
        if (anchor.extent?.type == 'image') {
          if (
            !(
              startAnchor &&
              startAnchor.extent?.type == 'image' &&
              startAnchor == anchor &&
              startAnchor.nodeId == currentNode.nodeId
            )
          ) {
            anchorElementList.push(
              <div
                id={anchor.anchorId}
                key={'image.' + anchor.anchorId}
                className="image-anchor"
                onClick={(e) => {
                  handleAnchorSelect(e, anchor)
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  height: anchor.extent.height,
                  left: anchor.extent.left,
                  top: anchor.extent.top,
                  width: anchor.extent.width,
                }}
              />
            )
          }
        }
      })
      if (
        startAnchor &&
        startAnchor.extent?.type == 'image' &&
        startAnchor.nodeId == currentNode.nodeId
      ) {
        anchorElementList.push(
          <div
            id={startAnchor.anchorId}
            key={'image.startAnchor' + startAnchor.anchorId}
            className="image-startAnchor"
            style={{
              height: startAnchor.extent.height,
              left: startAnchor.extent.left,
              top: startAnchor.extent.top,
              width: startAnchor.extent.width,
            }}
          />
        )
      }
      setImageAnchors(anchorElementList)
    }

    // display the selected anchors
    selectedAnchorIds.forEach((anchorId) => {
      const prevSelectedAnchor = document.getElementById(anchorId)
      if (prevSelectedAnchor) {
        prevSelectedAnchor.style.backgroundColor = ''
      }
    })
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    const newSelectedAnchorIds: string[] = []
    console.log(selectedAnchors?.length)
    selectedAnchors &&
      selectedAnchors.forEach((anchor) => {
        if (anchor) {
          if (anchor.extent === null && imageContainer.current) {
            imageContainer.current.style.outline = 'solid 5px #d7ecff'
          }
          const anchorElement = document.getElementById(anchor.anchorId)
          if (anchorElement) {
            anchorElement.style.backgroundColor = '#d7ecff'
            anchorElement.style.opacity = '60%'
            newSelectedAnchorIds.push(anchorElement.id)
          }
        }
      })
    setSelectedAnchorIds(newSelectedAnchorIds)
  }, [currentNode, startAnchor, selectedAnchorIds, selectedAnchors])

  /**
   * To trigger on load and when we setSelectedExtent
   */
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
    if (selection.current) {
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
  }, [setSelectedExtent, refreshLinkList])

  useEffect(() => {
    displayImageAnchors()
  }, [selectedAnchors, currentNode, refreshLinkList, startAnchor])

  /**
   * onPointerDown initializes the selection
   * @param e
   */
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    // The y location of the image top in the browser
    const imageTop = imageContainer.current?.getBoundingClientRect().top
    // The x location of the image left in the browser
    const imageLeft = imageContainer.current?.getBoundingClientRect().left

    const x = e.clientX // The x location of the pointer in the browser
    const y = e.clientY // The y location of the poitner in the browser
    xLast = e.clientX
    yLast = e.clientY
    if (selection.current && imageLeft && imageTop) {
      selection.current.style.left = String(x - imageLeft) + 'px'
      selection.current.style.top = String(y - imageTop) + 'px'
      currentLeft = x - imageLeft
      currentTop = y - imageTop
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
    document.removeEventListener('pointermove', onPointerMove)
    document.addEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerup', onPointerUp)
  }

  /**
   * onMove resizes the selection
   * @param e
   */
  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragging) {
      const x = e.clientX // The x location of the pointer in the browser
      const y = e.clientY // The y location of the poitner in the browser
      const deltaX = x - xLast // The change in the x location
      const deltaY = y - yLast // The change in the y location
      xLast = e.clientX
      yLast = e.clientY

      if (selection.current) {
        const imageTop = imageContainer.current?.getBoundingClientRect().top
        const imageLeft = imageContainer.current?.getBoundingClientRect().left
        let left = parseFloat(selection.current.style.left)
        let top = parseFloat(selection.current.style.top)
        let width = parseFloat(selection.current.style.width)
        let height = parseFloat(selection.current.style.height)

        // Horizontal dragging
        // Case A: Dragging above start point
        if (imageLeft && x - imageLeft < currentLeft) {
          width -= deltaX
          left += deltaX
          selection.current.style.left = String(left) + 'px'
          // Case B: Dragging below start point
        } else {
          width += deltaX
        }

        // Vertical dragging
        // Case A: Dragging to the left of start point
        if (imageTop && y - imageTop < currentTop) {
          height -= deltaY
          top += deltaY
          selection.current.style.top = String(top) + 'px'
          // Case B: Dragging to the right of start point
        } else {
          height += deltaY
        }

        // Update height and width
        selection.current.style.width = String(width) + 'px'
        selection.current.style.height = String(height) + 'px'
      }
    }
  }

  /**
   * onPointerUp so we have completed making our selection,
   * therefore we should create a new IImageExtent and
   * update the currently selected extent
   * @param e
   */
  const onPointerUp = (e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (selection.current) {
      currentTop = 0
      currentLeft = 0
      const extent: IImageExtent = {
        type: 'image',
        height: parseFloat(selection.current.style.height),
        left: parseFloat(selection.current.style.left),
        top: parseFloat(selection.current.style.top),
        width: parseFloat(selection.current.style.width),
      }
      // Check if setSelectedExtent exists, if it does then update it
      if (setSelectedExtent) {
        setSelectedExtent(extent)
      }
    }
    // Remove pointer event listeners
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerup', onPointerUp)
  }

  const onHandleClearSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (setSelectedExtent) {
      setSelectedExtent(null)
      if (selection.current) {
        // Note: This is a rather hacky solution to hide the selected region
        selection.current.style.left = '-50px'
        selection.current.style.top = '-50px'
        selection.current.style.width = '0px'
        selection.current.style.height = '0px'
      }
    }
  }

  return (
    <div className="imageWrapper">
      <div
        ref={imageContainer}
        onPointerDown={onPointerDown}
        className="imageContent-container"
      >
        {imageAnchors}
        {
          <div className="selection" ref={selection}>
            <div
              onClick={onHandleClearSelectionClick}
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="selection-close"
            >
              <ri.RiCloseFill />
            </div>
          </div>
        }
        <img src={content} />
      </div>
    </div>
  )
}
