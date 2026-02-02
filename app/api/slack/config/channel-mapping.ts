import { SaleOrigin } from "@prisma/client"
import { SlackChannelMapping } from "../types"

export const SLACK_CHANNEL_MAPPING: SlackChannelMapping[] = [
  {
    channelId: "C09AQQJE8BD",
    saleOrigin: SaleOrigin.INTERNATIONAL_LAW,
    allowedUsers: [
      'U4DHS9FB6',
      'U4E889XMF',
      'U037CL9A8F6'
    ]
  },
  {
    channelId: "C09AQQJE8BD",
    saleOrigin: SaleOrigin.FAMILY_LAW,
    allowedUsers: [
      'U02F4F2M9U4',
      'U04503LN5PH',
      'UGK9LH1L3'
    ]
  },
  {
    channelId: "C09AQQJE8BD",
    saleOrigin: SaleOrigin.BANKING_LAW,
    allowedUsers: [
      'U4CRYQQHF',
      'U087EGM1WPM',
      'U0877JN0UNN'
    ]
  },
  {
    channelId: "C09AQQJE8BD",
    saleOrigin: SaleOrigin.PROCEDURAL_LAW,
    allowedUsers: [
      'U07BM6NE61Z',
      'U084B5C36N6',
      'U02K2LT5B8D',
      'U041Q9QQ97F'
    ]
  },
  {
    channelId: "C09AQQJE8BD",
    saleOrigin: SaleOrigin.ADMINISTRATIVE,
    allowedUsers: [
      'U08PJ7QV7SQ',
      'U09GWADRNVB',
      'U096DQFF56C'
    ]
  },
]

export const getSaleOriginFromChannel = (channelId: string): SaleOrigin | null => {
  const mapping = SLACK_CHANNEL_MAPPING.find((m) => m.channelId === channelId)
  return mapping?.saleOrigin ?? null
}

export const isUserAllowedInChannel = (channelId: string, userId: string): boolean => {
  const mapping = SLACK_CHANNEL_MAPPING.find((m) => m.channelId === channelId)
  if (!mapping) return false
  if (!mapping.allowedUsers || mapping.allowedUsers.length === 0) return true
  return mapping.allowedUsers.includes(userId)
}
