import { Serializer } from "./serializer";

export class Stack extends Uint8Array {
	offsets: i32[];
	start: u16;
	end: u16;

	constructor(length: u16) {
			super(length);
			this.offsets = [];
			this.start = 0;
			this.end = 0;
	}

	hasSpace(length: i32): bool {
			return this.end + length + 1 < this.length;
	}

	shiftInt32(): i32 {
			const data: Uint8Array = this.slice(this.start, 4);
			const value: i32 = Serializer.fromInt32(data);

			return value;
	}

	pushInt32(value: i32): bool {
			const length: i32 = 4;

			if(!this.hasSpace(length)) {
					return false;
			}

			const data: Uint8Array = Serializer.fromInt32(value);
			this.set(data, this.end);

			this.offsets.push(this.end);
			this.end += length;

			return true;
	}

	popInt32(): i32 {
			if(this.offsets.length === 0) {
					return 0;
			}

			const data: Uint8Array = this.slice(this.offsets.pop(), this.end);
			return Serializer.intoInt32(data);
	}

	pushString(value: string): bool {
			const length: i32 = 4 + (value.length * 2);

			if(!this.hasSpace(length)) {
					return false;
			}

			const data: Uint8Array = Serializer.fromString(value);
			this.set(data, this.end);

			this.offsets.push(this.end);
			this.end += length;

			return true;
	}

	popString(): string {
			if(this.offsets.length === 0) {
					return "";
			}

			const data: Uint8Array = this.slice(this.offsets.pop(), this.end);
			return Serializer.intoString(data);
	}
}