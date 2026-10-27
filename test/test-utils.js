import { assert } from "chai";

export function assertSubset(subset, superset) {
  // If subset is null/undefined, it's only a subset if superset is also null/undefined
  if (subset === null || subset === undefined) {
    return superset === null || superset === undefined;
  }

  // If subset is a primitive, compare directly
  if (typeof subset !== "object") {
    return subset === superset;
  }

  // If subset is an object but superset is not, they can't match
  if (typeof superset !== "object" || superset === null) {
    return false;
  }

  // Handle Date objects - both must be Dates with equal values
  if (subset instanceof Date) {
    return superset instanceof Date && subset.valueOf() === superset.valueOf();
  }

  // Handle arrays - every element in subset must exist in superset
  if (Array.isArray(subset)) {
    if (!Array.isArray(superset)) {
      return false;
    }
    // For each element in subset, find a matching element in superset
    return subset.every((subsetItem) => superset.some((supersetItem) => assertSubset(subsetItem, supersetItem)));
  }

  // Handle objects - every key-value pair in subset must exist in superset
  return Object.keys(subset).every((key) => {
    // Key must exist in superset
    if (!(key in superset)) {
      assert.fail(`Key ${key} not found in superset`);
      return false;
    }

    const subsetValue = subset[key];
    const supersetValue = superset[key];
    assert.equal(subsetValue, supersetValue);

    // Recursively check if subsetValue is a subset of supersetValue
    return assertSubset(subsetValue, supersetValue);
  });
}
