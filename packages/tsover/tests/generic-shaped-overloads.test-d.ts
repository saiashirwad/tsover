'use tsover';

import { Operator } from 'tsover-runtime';

type Shape = [number, number];
type Broadcast<A extends Shape, B extends Shape> = A extends [infer M extends number, 1]
  ? B extends [1, infer N extends number]
    ? [M, N]
    : never
  : never;
type BroadcastCheck<A extends Shape, B extends Shape> = [Broadcast<A, B>] extends [never]
  ? { readonly incompatibleShapes: unique symbol }
  : unknown;

declare class Tensor<S extends Shape> {
  readonly shape: S;

  [Operator.plus]<S2 extends Shape>(
    lhs: Tensor<S>,
    rhs: Tensor<S2> & BroadcastCheck<S, S2>,
  ): Tensor<Broadcast<S, S2>>;
}

declare const column: Tensor<[2, 1]>;
declare const row: Tensor<[1, 3]>;
const matrix = column + row;

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
type _matrixShape = Expect<Equal<typeof matrix.shape, [2, 3]>>;

declare const incompatible: Tensor<[4, 2]>;
// @ts-expect-error the inferred right-hand shape fails BroadcastCheck
const invalid = column + incompatible;
void invalid;
