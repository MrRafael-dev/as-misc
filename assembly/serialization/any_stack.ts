import { Serializer } from "./serializer";

/**
 * @class AnyStack
 * 
 * @description
 * Representa uma pilha multivalorada. Os valores são adicionados e removidos
 * utilizando o algoritmo FIFO (*First In, First Out*).
 * 
 * Uma pilha pode possuir no máximo até 64KB de tamanho.
 */
export class AnyStack extends Uint8Array {
	/** Cursor atual da pilha. */
	private _cursor: u16;

	/**
	 * @constructor
	 * 
	 * @param length Tamanho da pilha.
	 * @param head Quando `true`, configura o cursor para o final da pilha.
	 */
	constructor(length: u16, head: bool = false) {
		super(length);
		this._cursor = head ? this.length : 0;
	}

	/**
	 * Cursor atual da pilha.
	 */
	set cursor(value: i32) {
		this._cursor = (value as i32) % this.length;
	}

	/**
	 * Cursor atual da pilha.
	 */
	get cursor(): u16 {
		return this._cursor;
	}

	/**
	 * Avança a pilha até o final.
	 * 
	 * @returns {this}
	 */
	head(): this {
		this._cursor = this.length - 1;
		return this;
	}

	/**
	 * Retoma a pilha de volta ao início.
	 * 
	 * @returns {this}
	 */
	tail(): this {
		this._cursor = 0;
		return this;
	}

	/**
	 * Verifica se a pilha está vazia.
	 * 
	 * @returns {bool}
	 */
	isEmpty(): bool {
		return this._cursor <= 0;
	}

	/**
	 * Verifica se a pilha possui alocação suficiente para um determinado valor.
	 * 
	 * @param length Tamanho.
	 * 
	 * @returns {bool}
	 */
	hasSpace(length: i32): bool {
		return this._cursor + length < this.length;
	}

	/**
	 * Salva um valor do tipo `u8` na pilha.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {bool}
	 */
	pushByte(value: i32): bool {
		// Tamanho da alocação.
		const length: i32 = 1;

		// Encerrar operação quando não possuir espaço suficiente...
		if (!this.hasSpace(length)) {
			return false;
		}

		// Salvar valor...
		this[this._cursor] = value;

		// Atualizar offsets...
		this._cursor += length;

		return true;
	}

	/**
	 * Retira o último valor inserido na pilha como `u8`.
	 * 
	 * @returns {i32}
	 */
	popByte(): i32 {
		// Retornar um valor padrão quando a pilha estiver vazia...
		if (this.isEmpty()) {
			return 0;
		}

		const value: i32 = this[this._cursor];

		this._cursor -= 1;
		return value;
	}

	/**
	 * Salva um valor do tipo `i16` na pilha.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {bool}
	 */
	pushInt16(value: i32): bool {
		// Tamanho da alocação.
		const length: i32 = 2;

		// Encerrar operação quando não possuir espaço suficiente...
		if (!this.hasSpace(length)) {
			return false;
		}

		// Converter dados e salvar valor...
		this.set(
			Serializer.fromInt16(value),
			this._cursor
		);

		// Atualizar offsets...
		this._cursor += length;

		return true;
	}

	/**
	 * Retira o último valor inserido na pilha como `i16`.
	 * 
	 * @returns {i32}
	 */
	popInt16(): i32 {
		// Retornar um valor padrão quando a pilha estiver vazia...
		if (this.isEmpty()) {
			return 0;
		}

		const value: i32 = Serializer.intoInt16(
			this.slice(this._cursor - 2, this._cursor)
		);

		this._cursor -= 2;
		return value;
	}

	/**
	 * Salva um valor do tipo `i32` na pilha.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {bool}
	 */
	pushInt32(value: i32): bool {
		// Tamanho da alocação.
		const length: i32 = 4;

		// Encerrar operação quando não possuir espaço suficiente...
		if (!this.hasSpace(length)) {
			return false;
		}

		// Converter dados e salvar valor...
		this.set(
			Serializer.fromInt32(value),
			this._cursor
		);

		// Atualizar offsets...
		this._cursor += length;

		return true;
	}

	/**
	 * Retira o último valor inserido na pilha como `i32`.
	 * 
	 * @returns {i32}
	 */
	popInt32(): i32 {
		// Retornar um valor padrão quando a pilha estiver vazia...
		if (this.isEmpty()) {
			return 0;
		}

		const value: i32 = Serializer.intoInt32(
			this.slice(this._cursor - 4, this._cursor)
		);

		this._cursor -= 4;
		return value;
	}

	/**
	 * Salva um valor do tipo `string` na pilha.
	 * 
	 * @param value Valor.
	 * 
	 * @returns {bool}
	 */
	pushString(value: string): bool {
		// Tamanho da alocação.
		const length: i32 = (value.length * 2) + 4;

		// Encerrar operação quando não possuir espaço suficiente...
		if (!this.hasSpace(length)) {
			return false;
		}

		// Dados da string (sem tamanho).
		const stringData: Uint8Array = Serializer.fromString(value).slice(4);

		// Converter dados e salvar valor...
		this.set(
			stringData,
			this._cursor
		);

		// Salvar tamanho da string em outro lugar...
		this.set(
			Serializer.fromInt32(value.length),
			this._cursor + stringData.length
		)

		// Atualizar offsets...
		this._cursor += length;

		return true;
	}

	/**
	 * Retira o último valor inserido na pilha como `string`.
	 * 
	 * @returns {string}
	 */
	popString(): string {
		// Retornar um valor padrão quando a pilha estiver vazia...
		if (this.isEmpty()) {
			return "";
		}

		// Obter tamanho da string.
		const stringSizeData: Uint8Array = this.slice(this._cursor - 4, this._cursor);
		const stringSize: i32 = Serializer.intoInt32(stringSizeData);

		// Obter string (sem tamanho).
		const stringData: Uint8Array = this.slice(this._cursor - (stringSize * 2) - 4, this._cursor - 4);

		// Estrutura da string, com tamanho e conteúdo invertidos.
		const stringStructure: Uint8Array = new Uint8Array(4 + (stringSize * 2));
		stringStructure.set(stringSizeData, 0);
		stringStructure.set(stringData, 4);

		// Converter dados e obter valor...
		const value: string = Serializer.intoString(stringStructure);

		// Atualizar offsets e encerrar a operação:
		this._cursor -= (stringSize * 2) - 4;
		return value;
	}
}