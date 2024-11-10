/** Please read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json */

declare global {
  interface BigInt {
    toJSON(): Number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};
