const asyncStorage = {
  async getItem() {
    return null;
  },
  async setItem() {
    return undefined;
  },
  async removeItem() {
    return undefined;
  },
  async mergeItem() {
    return undefined;
  },
  async clear() {
    return undefined;
  }
};

export default asyncStorage;
export const AsyncStorage = asyncStorage;
