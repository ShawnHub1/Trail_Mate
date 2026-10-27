import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { resetStores } from "../../src/models/memory-stores.js";
import { placeApi } from "../../src/api/place-api.js";

const response = (body) => ({ response: (value) => ({ code: (status) => ({ value, status }) }) });

suite("Place API handlers", () => {
  setup(() => resetStores());

  test("creates a place for the authenticated user", async () => {
    const result = await placeApi.create.handler({
      auth: { credentials: { _id: "user-1" } }, payload: { name: "Glenveagh" },
    }, response());
    assert.equal(result.status, 201);
    assert.equal(result.value.userId, "user-1");
  });

  test("lists only the authenticated user's places", async () => {
    await db.placeStore.addPlace({ name: "Mine", userId: "user-1" });
    await db.placeStore.addPlace({ name: "Theirs", userId: "user-2" });
    const result = await placeApi.find.handler({ auth: { credentials: { _id: "user-1" } } });
    assert.lengthOf(result, 1);
    assert.equal(result[0].name, "Mine");
  });

  test("does not reveal another user's place", async () => {
    const place = await db.placeStore.addPlace({ name: "Private", userId: "user-2" });
    const result = await placeApi.findOne.handler({
      params: { id: place._id }, auth: { credentials: { _id: "user-1" } },
    });
    assert.equal(result.output.statusCode, 404);
  });
});
