import { getWalkTokens, tokenizer } from "./index";

describe("universal shortcode", () => {
  const fakeThis = {
    lexer: {
      inline: jest.fn(),
    },
  };

  describe("tokenizer", () => {    
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

  describe("getWalkTokens", () => {
    const onShortCode = jest.fn();
    const walkTokens = getWalkTokens(onShortCode);

    it("should return a function.", () => {
      expect(walkTokens).toBeInstanceOf(Function);
    });

    it("should call onShortCode with the token's args and assign the result to the token's html property.", async () => {
      onShortCode.mockResolvedValue("<p>Test</p>");
      const src = "This is a test string with a shortcode [PSC foo=\"bar\" baz='qux' ab=0 cd=true]";
      const token = tokenizer.call(fakeThis, src);
      await walkTokens(token);
      expect(onShortCode).toHaveBeenCalledWith({
        foo: "bar",
        baz: "qux",
        ab: 0,
        cd: true,
      });
      expect(token && token.html).toBe("<p>Test</p>");
    });
  });
});
