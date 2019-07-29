import { DEBUG } from '@glimmer/env';
import { test, skip } from 'qunit';

export default function testInProduction() {
  if (DEBUG) {
    skip(...arguments);
  } else {
    test(...arguments);
  }
}
