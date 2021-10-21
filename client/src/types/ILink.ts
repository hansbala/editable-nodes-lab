/** A bidirectional link between two anchors */
export interface ILink {
  anchor1Id: string
  anchor2Id: string
  dateCreated?: Date
  explainer: string
  linkId: string
  title: string
}
