import { MapDataAdapter } from "@torch-orm/core";
import { runAdapterTests } from "@torch-orm/test";
import { describe, it, beforeEach, afterAll, expect } from "@jest/globals";

runAdapterTests("MapDataAdapter", () => new MapDataAdapter(), {
  describe,
  it,
  beforeEach,
  afterAll,
  expect: expect as any,
});
