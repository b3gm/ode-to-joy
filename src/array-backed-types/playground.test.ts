interface Address {
  street: string;
  nr: number;
  zip: number;
  city: string;
}

interface Person {
  firstName: string;
  lastName: string;
  age: number;
  address: Address;
}

type MyFunction = (...args: any[]) => any;

type B = Address extends (string | undefined | null) ? true : false;

type ValidProperties<T> = {
  [K in keyof T as T[K] extends (string | undefined | null) ? never : K]?: T[K][];
}

type ValidPersonProps = ValidProperties<Person>;
