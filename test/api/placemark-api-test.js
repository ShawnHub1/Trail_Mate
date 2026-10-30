import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { resetStores } from "../../src/models/memory-stores.js";
import { placeApi } from "../../src/api/place-api.js";
import { PlaceSpec } from "../../src/models/joi-schemas.js";
import { dashboardController } from "../../src/controllers/dashboard-controller.js";

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

  test("accepts empty descriptions and validates coordinate ranges and pairs", () => {
    assert.isUndefined(PlaceSpec.validate({ name: "Name only" }).error, "name is the only required field");
    assert.isUndefined(PlaceSpec.validate({ name: "Coast", description: "" }).error);
    assert.isUndefined(PlaceSpec.validate({ name: "Coast", latitude: -90, longitude: 180 }).error);
    assert.isUndefined(PlaceSpec.validate({ name: "Coast", latitude: "", longitude: "" }).error);
    assert.isDefined(PlaceSpec.validate({ name: "Coast", latitude: 90.01, longitude: 0 }).error);
    assert.isDefined(PlaceSpec.validate({ name: "Coast", latitude: 10 }).error);
    assert.isDefined(PlaceSpec.validate({ name: "x".repeat(101) }).error);
    assert.isDefined(PlaceSpec.validate({ name: "Coast", description: "x".repeat(2001) }).error);
    assert.isDefined(PlaceSpec.validate({ name: "Coast", longitude: 0 }).error);
  });

  test("creates a dashboard place with only its required name", async () => {
    const { value: payload, error } = PlaceSpec.validate({ name: "Name only" });
    assert.isUndefined(error);
    const result = await dashboardController.addPlace.handler({
      auth: { credentials: { _id: "user-1" } }, payload,
    }, { redirect: (path) => path });

    assert.equal(result, "/dashboard");
    const [place] = await db.placeStore.getUserPlaces("user-1");
    assert.equal(place.name, "Name only");
    assert.equal(place.description, "");
    assert.isNull(place.latitude);
    assert.isNull(place.longitude);
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
