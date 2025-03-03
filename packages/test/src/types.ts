export type ItFunction = (name: string, fn: () => void | Promise<void>) => void;
export type DescribeFunction = (name: string, fn: () => void) => void;
export type BeforeEachFunction = (fn: () => void | Promise<void>) => void;
export type AfterAllFunction = (fn: () => void | Promise<void>) => void;
export type ExpectFunction = {
  (value: any): {
    toEqual: (expected: any) => void;
    toHaveLength: (expected: number) => void;
    toBe: (expected: any) => void;
  } & {
    resolves: {
      not: {
        toThrow: () => Promise<void>;
      };
    };
    rejects: {
      toThrow: (message: string | RegExp) => Promise<void>;
    };
  };
} & {
  resolves: {
    not: {
      toThrow: () => Promise<void>;
    };
  };
  rejects: {
    toThrow: (message: string) => Promise<void>;
  };
};

export interface TestFunctions {
  describe: DescribeFunction;
  it: ItFunction;
  beforeEach: BeforeEachFunction;
  afterAll: AfterAllFunction;
  expect: ExpectFunction;
}
