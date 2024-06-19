import { isEven, isOdd } from "src/index";

describe("isEven", () => {
  it("should return true", () => {
    const result = isEven(20);
    expect(result).toEqual(true);
  });
});

describe("isOdd", () => {
  it("should return true", () => {
    const result = isOdd(21);
    expect(result).toEqual(true);
  });
});
