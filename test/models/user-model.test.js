import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { resetStores } from "../../src/models/memory-stores.js";
import { sampleUser } from "../fixtures.js";

suite("User model", () => {
  setup(() => resetStores());

  test("creates users without exposing passwords", async () => {
    const user = await db.userStore.addUser(sampleUser);
    assert.isString(user._id);
    assert.notProperty(user, "password");
    assert.equal(await db.userStore.verifyPassword(await db.userStore.getUserByEmail(user.email), sampleUser.password), true);
  });

  test("finds a user by id and normalized email", async () => {
    const user = await db.userStore.addUser(sampleUser);
    assert.deepEqual(await db.userStore.getUserById(user._id), user);
    assert.equal((await db.userStore.getUserByEmail("MAGGIE@example.com"))._id, user._id);
  });

  test("rejects duplicate email addresses", async () => {
    await db.userStore.addUser(sampleUser);
    try {
      await db.userStore.addUser(sampleUser);
      assert.fail("Expected duplicate email to be rejected");
    } catch (error) {
      assert.include(error.message, "already exists");
    }
  });
});
