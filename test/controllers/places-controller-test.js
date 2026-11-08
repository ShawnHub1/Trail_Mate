import { assert } from "chai";
import { placesController } from "../../src/controllers/places-controller.js";
import { PlaceSpec } from "../../src/models/joi-schemas.js";
import { db } from "../../src/models/db.js";
import { resetStores } from "../../src/models/memory-stores.js";

function createToolkit() {
  return {
    view(template, viewData) {
      return {
        template,
        viewData,
        takeover() { this.takenOver = true; return this; },
        code(statusCode) { this.statusCode = statusCode; return this; },
      };
    },
    response() {
      return { code: (statusCode) => ({ statusCode }) };
    },
    redirect(path) { return path; },
  };
}

suite("Place web edit handlers", () => {
  setup(() => resetStores());

  test("shows the owner's existing place values in the edit form", async () => {
    const place = await db.placeStore.addPlace({
      userId: "owner-1",
      name: "Coastal path",
      description: "A route by the sea",
      difficulty: "Moderate",
      distanceKm: 4.5,
      latitude: 53.1,
      longitude: -6.2,
    });

    const result = await placesController.edit.handler({
      params: { id: place._id },
      auth: { credentials: { _id: "owner-1" } },
    }, createToolkit());

    assert.equal(result.template, "edit-place");
    assert.equal(result.viewData.place._id, place._id);
    assert.equal(result.viewData.form.name, "Coastal path");
    assert.equal(result.viewData.form.distanceKm, 4.5);
    assert.isTrue(result.viewData.difficultyOptions.find((option) => option.value === "Moderate").selected);
  });

  test("validates and saves the owner's changes", async () => {
    const place = await db.placeStore.addPlace({
      userId: "owner-1", name: "Old name", description: "Old description", difficulty: "Easy",
    });
    const { value: payload, error } = PlaceSpec.validate({
      name: "New name",
      description: "Updated description",
      difficulty: "Hard",
      distanceKm: "7.5",
      latitude: "53.2",
      longitude: "-6.3",
    });
    assert.isUndefined(error);

    const result = await placesController.update.handler({
      params: { id: place._id },
      auth: { credentials: { _id: "owner-1" } },
      payload,
    }, createToolkit());

    assert.equal(result, `/place/${place._id}`);
    const saved = await db.placeStore.getPlaceById(place._id);
    assert.equal(saved.name, "New name");
    assert.equal(saved.description, "Updated description");
    assert.equal(saved.difficulty, "Hard");
    assert.equal(saved.distanceKm, 7.5);
    assert.equal(saved.latitude, 53.2);
    assert.equal(saved.longitude, -6.3);
  });

  test("re-renders the form with submitted values and errors for invalid input", async () => {
    const place = await db.placeStore.addPlace({ userId: "owner-1", name: "Coastal path" });
    const payload = { name: "", description: "Keep this text", difficulty: "Easy" };
    const { error } = PlaceSpec.validate(payload);
    assert.isDefined(error);

    const result = await placesController.update.validate.failAction({
      params: { id: place._id },
      auth: { credentials: { _id: "owner-1" } },
      payload,
    }, createToolkit(), error);

    assert.equal(result.template, "edit-place");
    assert.equal(result.statusCode, 400);
    assert.isTrue(result.takenOver);
    assert.equal(result.viewData.form.name, "");
    assert.equal(result.viewData.form.description, "Keep this text");
    assert.isNotEmpty(result.viewData.errors);
    assert.equal((await db.placeStore.getPlaceById(place._id)).name, "Coastal path");
  });

  test("does not let another user view or update the place", async () => {
    const place = await db.placeStore.addPlace({ userId: "owner-1", name: "Private path" });
    const request = {
      params: { id: place._id },
      auth: { credentials: { _id: "owner-2" } },
    };
    const toolkit = createToolkit();

    const editResult = await placesController.edit.handler(request, toolkit);
    const updateResult = await placesController.update.handler({
      ...request,
      payload: { name: "Changed by someone else" },
    }, toolkit);

    assert.equal(editResult.statusCode, 404);
    assert.equal(updateResult.statusCode, 404);
    assert.equal((await db.placeStore.getPlaceById(place._id)).name, "Private path");
  });
});
