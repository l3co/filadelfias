import { Store } from "@tauri-apps/plugin-store";

let store: Store | null = null;

async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load("auth.bin");
  }

  return store;
}

export const secureStore = {
  async set(key: string, value: string): Promise<void> {
    const currentStore = await getStore();
    await currentStore.set(key, value);
    await currentStore.save();
  },

  async get(key: string): Promise<string | null> {
    const currentStore = await getStore();
    return (await currentStore.get<string>(key)) ?? null;
  },

  async delete(key: string): Promise<void> {
    const currentStore = await getStore();
    await currentStore.delete(key);
    await currentStore.save();
  },

  async clear(): Promise<void> {
    const currentStore = await getStore();
    await currentStore.clear();
    await currentStore.save();
  },
};
