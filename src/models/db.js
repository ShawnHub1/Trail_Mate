import { placeStore, userStore } from "./memory-stores.js";
import { placeMongoStore } from "./mongo/place-mongo-store.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";

export const db = { userStore, placeStore };

export function useMongoStores() {
  db.userStore = userMongoStore;
  db.placeStore = placeMongoStore;
}