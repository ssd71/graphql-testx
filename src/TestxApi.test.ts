import test from "ava";
import { isTestxApiMethod } from "./TestxApi";
import { TestxServer } from "./TestxServer";

test("is TestxApi method", t => {
  const schema = `
  type User {
    id: ID!
    name: String
  }
  `;
  const testx = new TestxServer({ schema });
  t.true(isTestxApiMethod(testx, "setData"));
  t.true(isTestxApiMethod(testx, "start"));
  t.false(isTestxApiMethod(testx, "foo"));
});
