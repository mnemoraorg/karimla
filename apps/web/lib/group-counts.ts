import type { GroupDetail } from "@/api/groups"

/**
 * Applies a count tap to cached group detail. The decrement floors at zero
 * because the service never stores a negative count. Returns the input
 * untouched when there is nothing cached to adjust.
 */
export function withMemberCountAdjusted(
  detail: GroupDetail | undefined,
  userId: string,
  delta: 1 | -1,
): GroupDetail | undefined {
  if (!detail) return detail

  return {
    ...detail,
    members: detail.members.map((member) =>
      member.user_id === userId ? { ...member, count: Math.max(0, member.count + delta) } : member,
    ),
  }
}
