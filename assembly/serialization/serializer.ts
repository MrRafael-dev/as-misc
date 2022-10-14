/**
 * @class Serializer
 * 
 * @description
 * Funções utilitárias para transferência de dados.
 */
export class Serializer {
	/**
	 * Serializa um valor do tipo `i16` para um objeto binário.
	 * 
	 * @param value Valor.
	 * @param littleEndian Quando `true`, inverte a ordenação de bytes.
	 * 
	 * @returns {Uint8Array}
	 */
	static fromInt16(value: i16, littleEndian: bool = false): Uint8Array {
		// Resultado.
		const result: Uint8Array = new Uint8Array(2);

		// Dividir número em bytes (little-endian)...
		if(littleEndian) {
			for (let i: i16 = 1; i >= 0; i -= 1) {
				result[i] = 0xFF & (value >> (i * 8));
			}
		}
		
		// Dividir número em bytes (big-endian)...
		else {
			for (let i: i16 = 0; i < 2; i += 1) {
				result[i] = 0xFF & (value >> (i * 8));
			}
		}

		return result;
	}

	/**
	 * Deserializa um objeto binário para um valor do tipo `i16`.
	 * 
	 * @param value Valor.
	 * @param littleEndian Quando `true`, inverte a ordenação de bytes.
	 * 
	 * @returns {i16}
	 */
	static intoInt16(value: Uint8Array, littleEndian: bool = false): i16 {
		return value.byteLength >= 2 ?
			littleEndian?
				  value[1] * (0x0100)
				+ value[0] * (0x0001)
			: 	value[0] * (0x0100)
				+ value[1] * (0x0001)
			: 0;
	}

	/**
	 * Serializa um valor do tipo `i32` para um objeto binário.
	 * 
	 * @param value Valor.
	 * @param littleEndian Quando `true`, inverte a ordenação de bytes.
	 * 
	 * @returns {Uint8Array}
	 */
	static fromInt32(value: i32, littleEndian: bool = false): Uint8Array {
		// Resultado.
		const result: Uint8Array = new Uint8Array(4);

		// Dividir número em bytes (little-endian)...
		if(littleEndian) {
			for (let i: i32 = 3; i >= 0; i -= 1) {
				result[i] = 0xFF & (value >> (i * 8));
			}
		}

		// Dividir número em bytes (big-endian)...
		else {
			for (let i: i32 = 0; i < 4; i += 1) {
				result[i] = 0xFF & (value >> (i * 8));
			}
		}

		return result;
	}

	/**
	 * Deserializa um objeto binário para um valor do tipo `i32`.
	 * 
	 * @param value Valor.
	 * @param littleEndian Quando `true`, inverte a ordenação de bytes.
	 * 
	 * @returns {i32}
	 */
	static intoInt32(value: Uint8Array, littleEndian: bool = false): i32 {
		return value.byteLength >= 4 ?
			littleEndian?
				  value[3] * (0x00000001)
				+ value[2] * (0x00000100)
				+ value[1] * (0x00010000)
				+ value[0] * (0x01000000)
			: 	value[0] * (0x00000001)
				+ value[1] * (0x00000100)
				+ value[2] * (0x00010000)
				+ value[3] * (0x01000000)
			: 0;
	}

	/**
	 * Serializa um valor do tipo `string` para um objeto binário.
	 * Assume-se um texto codificado em 16-bits, com os primeiros 4 bytes
	 * determinando seu tamanho.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {Uint8Array}
	 */
	static fromString(value: string): Uint8Array {
		// Tamanho da string.
		const length: i32 = value.length;

		// Resultado.
		const result: Uint8Array = new Uint8Array(4 + (length * 2));

		// Bytes que representam o tamanho da string.
		const lbytes: Uint8Array = this.fromInt32(length);

		// Escrever tamanho da string no resultado...
		for (let i: i32 = 0; i < lbytes.byteLength; i += 1) {
			result[i] = lbytes[i];
		}

		// Escrever string no resultado...
		for (let i: i32 = 0; i < length; i += 1) {
			const charCode: i32 = value.charCodeAt(i);
			const cbytes: Uint8Array = this.fromInt16(charCode);

			result.set(cbytes, 4 + (i * 2));
		}

		return result;
	}

	/**
	 * Deserializa um objeto binário para um valor do tipo `string`.
	 * Assume-se um texto codificado em 16-bits, com os primeiros 4 bytes 
	 * determinando seu tamanho.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {string0}
	 */
	static intoString(value: Uint8Array): string {
		// Tamanho da string.
		const length: i32 = this.intoInt32(value);

		// Resultado.
		let result: string = "";

		// Entregar uma string vazia quando o tamanho for zero ou incoerente com o
		// tamanho da array de bytes:
		if (length <= 0 || value.byteLength < (length * 2) - 4) {
			return "";
		}

		// Escrever string do resultado...
		for (let i: i32 = 0; i < length; i += 1) {
			const charCode: i32 =
				value[4 + (i * 2)] * (0x0001)
				+ value[4 + (i * 2) + 1] * (0x0100);

			result += String.fromCharCode(charCode);
		}

		return result;
	}
}
