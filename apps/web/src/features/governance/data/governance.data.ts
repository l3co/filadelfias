import { governanceService } from '../../../services/governance';
import type { Council, Meeting } from '../../../services/governance';

const councilsPromiseCache = new Map<string, Promise<Council[]>>();

export async function getCouncils(tenantId: string): Promise<Council[]> {
  return governanceService.listCouncils(tenantId);
}

export async function getCouncil(tenantId: string, councilId: string): Promise<Council | undefined> {
  const councils = await getCouncils(tenantId);
  return councils.find((council) => council.id === councilId);
}

export async function getCouncilMeetings(tenantId: string, councilId: string): Promise<Meeting[]> {
  return governanceService.listMeetings(tenantId, councilId);
}

export function getCouncilsPromise(tenantId: string, refreshKey = 'default'): Promise<Council[]> {
  const cacheKey = `${tenantId}:${refreshKey}`;
  const cachedPromise = councilsPromiseCache.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = getCouncils(tenantId);
  councilsPromiseCache.set(cacheKey, promise);
  return promise;
}
