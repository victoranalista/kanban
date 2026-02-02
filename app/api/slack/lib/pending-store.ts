import { PendingApproval } from "../types"

const pendingApprovals = new Map<string, PendingApproval>()

export const storePendingApproval = (approval: PendingApproval): void => {
  pendingApprovals.set(approval.id, approval)
  setTimeout(() => pendingApprovals.delete(approval.id), 24 * 60 * 60 * 1000)
}

export const getPendingApproval = (id: string): PendingApproval | undefined => {
  return pendingApprovals.get(id)
}

export const updatePendingApproval = (id: string, updates: Partial<PendingApproval>): void => {
  const approval = pendingApprovals.get(id)
  if (approval) {
    pendingApprovals.set(id, { ...approval, ...updates })
  }
}

export const deletePendingApproval = (id: string): void => {
  pendingApprovals.delete(id)
}

export const findPendingApprovalByThread = (channelId: string, threadTs: string): PendingApproval | undefined => {
  for (const approval of pendingApprovals.values()) {
    if (approval.channelId === channelId && approval.threadTs === threadTs) {
      return approval
    }
  }
  return undefined
}
