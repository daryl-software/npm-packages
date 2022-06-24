import { describe } from "mocha";
import { expect } from "chai";

require('@ezweb/ts-helpers');

describe('ts-helpers', async () => {
  it('First', async  () => {
    const multiTypeArray: Array<any> = ['Bob', 1, true];
    expect(multiTypeArray.first())
  });
});
