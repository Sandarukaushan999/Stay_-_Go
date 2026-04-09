import { asyncHandler } from '../../../common/utils/asyncHandler.js'
import * as inboxService from '../services/riderInbox.service.js'

export const openRequests = asyncHandler(async (req, res) => {
  const items = await inboxService.listOpenRequests({ campusId: req.query?.campusId })
  res.json({ success: true, data: items })
})

