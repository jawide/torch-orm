import { MapDataAdapter } from '../adapters/MapDataAdapter';
import { runAdapterTests } from './utils/adapter-test-utils';

runAdapterTests(
  'MapDataAdapter',
  () => new MapDataAdapter()
); 