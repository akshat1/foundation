import { tokenizer } from "./index";

describe("universal shortcode", () => {
  describe("tokenizer", () => {
    const fakeThis = {
      lexer: {
        inline: jest.fn(),
      },
    };
    test("should return false if the source string does not contain a shortcode", () => {
      const src = "This is a test string.";
      const result = tokenizer.call(fakeThis, src);
      expect(result).toBe(false);
    });

    test("should return a token if the source string contains a shortcode", () => {
      const src = "This is a test string with a shortcode [PSC foo=\"bar\" baz='qux' ab=0 cd=true]";
      const result = tokenizer.call(fakeThis, src);
      expect(result).toMatchObject({
        type: "PSC",
        raw: "[PSC foo=\"bar\" baz='qux' ab=0 cd=true]",
        tokens: [],
        args: {
          foo: "bar",
          baz: "qux",
          ab: 0,
          cd: true,
        },
      });
    });
  });
});
