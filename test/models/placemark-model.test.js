import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { resetStores } from "../../src/models/memory-stores.js";
import { samplePlace } from "../fixtures.js";

suite("Place model", () => {
  setup(() => resetStores());

  test("creates and lists a named place for its owner", async () => {
    const place = await db.placeStore.addPlace(samplePlace);
    assert.isString(place._id);
    assert.deepEqual(await db.placeStore.getUserPlaces(samplePlace.userId), [place]);
  });

  test("updates a place only for its owner", async () => {
    const place = await db.placeStore.addPlace(samplePlace);
    const updated = await db.placeStore.updatePlace(place._id, { name: "Updated trail" }, samplePlace.userId);
    assert.equal(updated.name, "Updated trail");
    assert.isNull(await db.placeStore.updatePlace(place._id, { name: "Other" }, "another-user"));
  });

    test("stores descriptions and numeric coordinates and renders JSON only to the owner", async () => {
    const place = await db.placeStore.addPlace(samplePlace);
    const json = await db.placeStore.getPlaceJson(place._id, samplePlace.userId);
    assert.deepEqual(JSON.parse(json), place);
    assert.isNull(await db.placeStore.getPlaceJson(place._id, "another-user"));
    assert.equal(typeof place.latitude, "number");
    assert.equal(typeof place.longitude, "number");
  });
  
  test("deletes a place only for its owner", async () => {
    const place = await db.placeStore.addPlace(samplePlace);
    assert.isFalse(await db.placeStore.deletePlaceById(place._id, "another-user"));
    assert.isTrue(await db.placeStore.deletePlaceById(place._id, samplePlace.userId));
    assert.isNull(await db.placeStore.getPlaceById(place._id));
  });
});
