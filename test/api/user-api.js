import { assert } from "chai";
import { resetStores } from "../../src/models/memory-stores.js";
import { db } from "../../src/models/db.js";
import { userApi } from "../../src/api/user-api.js";

suite("User API handlers", () => {
  setup(() => resetStores());

  test("returns and updates only the authenticated user's public profile", async () => {
    const user = await db.userStore.addUser({
      firstName: "Maggie", lastName: "Simpson", email: "maggie@example.com", password: "trailmate-password",
    });
    const request = { auth: { credentials: user }, payload: {
      firstName: "Margaret", lastName: "Simpson", email: "margaret@example.com",
    } };
    const updated = await userApi.updateMe.handler(request);
    assert.equal(updated._id, user._id);
    assert.equal(updated.email, "margaret@example.com");
    assert.notProperty(updated, "password");
    assert.deepEqual(await userApi.findMe.handler(request), updated);
  });
});
