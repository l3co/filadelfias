import { membersService } from '../../../services/members';
import type { Member } from '../../../types/members.types';

const membersPromiseCache = new Map<string, Promise<Member[]>>();

export async function getMembers(tenantId: string): Promise<Member[]> {
  return membersService.listMembers(tenantId);
}

export async function getMember(tenantId: string, memberId: string): Promise<Member | undefined> {
  const members = await getMembers(tenantId);
  return members.find((member) => member.id === memberId);
}

export function getMembersPromise(tenantId: string, refreshKey = 'default'): Promise<Member[]> {
  const cacheKey = `${tenantId}:${refreshKey}`;
  const cachedPromise = membersPromiseCache.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = getMembers(tenantId);
  membersPromiseCache.set(cacheKey, promise);
  return promise;
}
