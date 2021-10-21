import { MongoClient } from 'mongodb'
import { LinkGateway } from '../../../links'
import { ILink, makeILink } from '../../../types'
import uniqid from 'uniqid'

jest.setTimeout(50000)

describe('E2E Test: Link CRUD', () => {
  let mongoClient: MongoClient
  let linkGateway: LinkGateway
  let uri: string
  let collectionName: string

  function generateLinkId() {
    return uniqid('link.')
  }
  function generateAnchorId() {
    return uniqid('anchor.')
  }

  const testLink: ILink = makeILink(
    generateLinkId(),
    generateAnchorId(),
    generateAnchorId()
  )

  beforeAll(async () => {
    uri = process.env.DB_URI
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    collectionName = 'e2e-test-link'
    linkGateway = new LinkGateway(mongoClient, collectionName)
    await mongoClient.connect()
    const getResponse = await linkGateway.getLinkById(testLink.linkId)
    expect(getResponse.success).toBeFalsy()
  })

  afterAll(async () => {
    await mongoClient.db().collection(collectionName).drop()
    const getResponse = await linkGateway.getLinkById(testLink.linkId)
    expect(getResponse.success).toBeFalsy()
    await mongoClient.close()
  })

  test('creates link', async () => {
    const response = await linkGateway.createLink(testLink)
    expect(response.success).toBeTruthy()
  })

  test('retrieves link', async () => {
    const response = await linkGateway.getLinkById(testLink.linkId)
    expect(response.success).toBeTruthy()
    expect(response.payload.linkId).toEqual(testLink.linkId)
  })

  test('deletes link', async () => {
    const deleteResponse = await linkGateway.deleteLink(testLink.linkId)
    expect(deleteResponse.success).toBeTruthy()

    const getResponse = await linkGateway.getLinkById(testLink.linkId)
    expect(getResponse.success).toBeFalsy()
  })
})
