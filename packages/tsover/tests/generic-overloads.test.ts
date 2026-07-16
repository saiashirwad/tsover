import { expect, expectTypeOf, test } from 'vitest';
import { Operator } from 'tsover-runtime';

class Cell<T> {
  constructor(readonly value: T) {}

  [Operator.plus]<U>(lhs: Cell<T>, rhs: Cell<U>): Cell<[T, U]> {
    return new Cell([lhs.value, rhs.value]);
  }
}

class ConstrainedCell<T> {
  constructor(readonly value: T) {}

  [Operator.star]<U extends T>(
    lhs: ConstrainedCell<T>,
    rhs: ConstrainedCell<U>,
  ): ConstrainedCell<U> {
    return new ConstrainedCell(rhs.value);
  }
}

test('infers type parameters in an operator overload', () => {
  'use tsover';

  const result = new Cell(1) + new Cell('right');

  expectTypeOf(result).toEqualTypeOf<Cell<[number, string]>>();
  expect(result.value).toStrictEqual([1, 'right']);
});

test('checks inferred type arguments against their constraints', () => {
  'use tsover';

  const lhs = new ConstrainedCell<number>(1);
  const rhs = new ConstrainedCell<1>(1);
  const result = lhs * rhs;

  expectTypeOf(result).toEqualTypeOf<ConstrainedCell<1>>();
  expect(result.value).toBe(1);
});

function typeErrors() {
  'use tsover';

  const invalid = new ConstrainedCell<string>('left');
  // @ts-expect-error number does not satisfy the left operand's string constraint
  const invalidResult = invalid * new ConstrainedCell<number>(1);
  return invalidResult;
}
void typeErrors;
