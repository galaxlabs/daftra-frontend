import { describe, expect, it } from "vitest";
import { deskUrl, docRoute } from "./api";

describe("api helpers", () => {
  it("creates a frontend doc route", () => expect(deskUrl("Sales Invoice")).toContain("#/doc/sales-invoice"));
  it("creates a frontend doc route with a name", () => expect(docRoute("Sales Invoice", "SINV-0001")).toContain("#/doc/sales-invoice/SINV-0001"));
});
