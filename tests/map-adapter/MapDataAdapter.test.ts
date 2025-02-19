import { MapDataAdapter } from "@torch-orm/core";
import { runAdapterTests } from "@torch-orm/test";

runAdapterTests("MapDataAdapter", () => new MapDataAdapter());
