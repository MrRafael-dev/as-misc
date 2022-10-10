import { SMap } from "../mapping";

class INIParser {
	static parse(raw: string): void {
		const result: SMap = new SMap();
		const lines: string[] = raw.split("\n");
		const hierarchy: string[] = [];
		const current: string = "";

		for (let i: i32 = 0; i < lines.length; i += 1) {
			const line = lines[i];
			const separator: i32 = line.indexOf("=");

			if (separator >= 0) {
				const key: string = line.substring(0, separator);
				const value: string = line.substring(separator + 1, line.length);

				result._set(key, value);
			}
			else if (line.startsWith("[")) {
				if (!line.endsWith("]")) {
					continue;
				}

				const property: string = line.substring(1, line.length - 1);

			}


		}
	}
}