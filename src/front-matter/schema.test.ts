import { validate } from "./schema";
import assert from "assert";

describe("validate", () => {
  it("should return an empty array when validation is succesful", () => {
    const actual = validate({
      authors: [],
      id: "foo",
      publishDate: "2022-01-01",
      title: "bar",
    });

    /// @ts-expect-error
    assert(actual, []);
  });

  it("should return the list of missing fields when validation fails", () => {
    /// @ts-expect-error
    assert(validate({
      id: "foo",
      authors: [],
      title: "bar",
      /// @ts-expect-error
    }), ["publishedDate"]);

    /// @ts-expect-error
    assert(validate({
      id: "foo",
      publishDate: "2022-01-01",
      /// @ts-expect-error
    }), ["authors", "title"]);
  });
});
