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
  test("updates only the selected profile and keeps password private", async () => {
    const first = await db.userStore.addUser(sampleUser);
    const second = await db.userStore.addUser({ ...sampleUser, email: "lisa@example.com" });
    const updated = await db.userStore.updateUser(first._id, {
      firstName: "Margaret", lastName: "Simpson", email: "maggie.new@example.com",
    });
    assert.equal(updated.firstName, "Margaret");
    assert.notProperty(updated, "password");
    assert.equal((await db.userStore.getUserById(second._id)).email, "lisa@example.com");
    assert.isTrue(await db.userStore.verifyPassword(await db.userStore.getUserByEmail(updated.email), sampleUser.password));
    try {
      await db.userStore.updateUser(second._id, { firstName: "Lisa", lastName: "Simpson", email: updated.email });
      assert.fail("Expected duplicate email to be rejected");
    } catch (error) {
      assert.include(error.message, "already exists");
    }
  });
});
