import { missionService } from '../../../services/missions';
import type { Missionary, SocialProject } from '../../../services/missions';

const missionariesPromiseCache = new Map<string, Promise<Missionary[]>>();
const socialProjectsPromiseCache = new Map<string, Promise<SocialProject[]>>();

export async function getMissionaries(tenantId: string): Promise<Missionary[]> {
  return missionService.listMissionaries(tenantId);
}

export async function getMissionary(tenantId: string, missionaryId: string): Promise<Missionary | undefined> {
  const missionaries = await getMissionaries(tenantId);
  return missionaries.find((missionary) => missionary.id === missionaryId);
}

export async function getSocialProjects(tenantId: string): Promise<SocialProject[]> {
  return missionService.listSocialProjects(tenantId);
}

export function getMissionariesPromise(tenantId: string, refreshKey = 'default'): Promise<Missionary[]> {
  const cacheKey = `${tenantId}:${refreshKey}`;
  const cachedPromise = missionariesPromiseCache.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = getMissionaries(tenantId);
  missionariesPromiseCache.set(cacheKey, promise);
  return promise;
}

export function getSocialProjectsPromise(tenantId: string, refreshKey = 'default'): Promise<SocialProject[]> {
  const cacheKey = `${tenantId}:${refreshKey}`;
  const cachedPromise = socialProjectsPromiseCache.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = getSocialProjects(tenantId);
  socialProjectsPromiseCache.set(cacheKey, promise);
  return promise;
}
