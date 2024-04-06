import { getWalkTokens, start, tokenizer } from "./inline";
import { SCToken } from "./typedefs";

describe("start", () => {
  it("should return the index of the next potential start of the custom token", () => {
    expect(start("This is some [P:I foo=bar] custom markdown")).toBe(13);
    expect(start("[P:I foo=bar] custom markdown")).toBe(0);
  });

  it("should return undefined if there is no potential start of the custom token", () => {
    expect(start("This is some regular markdown")).toBeUndefined();
    expect(start("This is markdown with escaped \\[P:I foo=bar] shortcode.")).toBeUndefined();
    expect(start("This is markdown with escaped BLAH[P:I foo=bar] shortcode.")).toBeUndefined();
  });
});

describe("tokenizer", () => {
  it("should return a custom token with the correct type, raw, text, tokens, and args", () => {
    const src = "[P:I pa=foo pb=\"bar\" pc=0 pd=true pe='baz' pf=1.5]";
    const token = tokenizer(src, []);
    expect(token).toEqual({
      type: "P:I",
      raw: src,
      text: src,
      tokens: [],
      html: "",
      args: {
        pa: "foo",
        pb: "bar",
        pc: 0,
        pd: true,
        pe: "baz",
        pf: 1.5,
      },
    });
  });
});

describe("getWalkTokens", () => {
  it("should set the html property of the token if the type is 'P:I' and onShortCode is a function", async () => {
    const onShortCode = jest.fn().mockResolvedValue("<p>ShortCode HTML</p>");
    const token: SCToken = {
      type: "P:I",
      raw: "",
      text: "",
      tokens: [],
      html: "",
      args: {},
    };
    await getWalkTokens(onShortCode)(token);
    expect(token.html).toBe("<p>ShortCode HTML</p>");
    expect(onShortCode).toHaveBeenCalledWith(token.args);
  });

  it("should not set the html property of the token if the type is not 'P:I'", async () => {
    const onShortCode = jest.fn().mockResolvedValue("<p>ShortCode HTML</p>");
    const token: SCToken = {
      type: "P:II",
      raw: "",
      text: "",
      tokens: [],
      html: "",
      args: {},
    };
    await getWalkTokens(onShortCode)(token);
    expect(token.html).toBe("");
    expect(onShortCode).not.toHaveBeenCalled();
  });

  it("should not set the html property of the token if onShortCode is not a function", async () => {
    const onShortCode = undefined;
    const token: SCToken = {
      type: "P:I",
      raw: "",
      text: "",
      tokens: [],
      html: "",
      args: {},
    };
    await getWalkTokens(onShortCode)(token);
    expect(token.html).toBe("");
  });
});
