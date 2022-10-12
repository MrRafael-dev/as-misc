/** Tipos da folha. */
export enum LeafType {
	Null = 0,
	String = 1,
	Int32 = 2,
	Bool = 3,
	Object = 4,
}

/**
 * @class Leaf
 * 
 * @description
 * Representa uma árvore de valores. Cada folha pode possuir um ou mais 
 * valores, dependendo de como for utilizada.
 */
export class Leaf {
	/** Tipo da folha. */
	private _leafType: LeafType;

	/** Valor da folha, quando considerada uma string. */
	private _stringValue: string | null;

	/** Valor da folha, quando considerada um número. */
	private _int32Value: i32 | null;

	/** Valor da folha, quando considerada um objeto. */
	private _children: Leaf[] | null;

	/**
	 * @constructor
	 * 
	 * @param leafType Tipo da folha.
	 * @param stringValue Valor da folha, quando considerada uma string.
	 * @param int32Value Valor da folha, quando considerada um número.
	 * @param children Valor da folha, quando considerada um objeto.
	 */
	constructor(leafType: LeafType = LeafType.Null, stringValue: string | null = null, int32Value: i32 | null = null, children: Leaf[] | null = null) {
		this._leafType = leafType;
		this._stringValue = stringValue;
		this._int32Value = int32Value;
		this._children = children;
	}

	/** Tipo desta folha. */
	get leafType(): LeafType {
		return this._leafType;
	}

	/** Tipo desta folha, em formato de texto. */
	get typeName(): string {
		if (this._leafType === LeafType.String) {
			return "string";
		}
		else if (this.leafType === LeafType.Int32) {
			return "number";
		}
		else if (this.leafType === LeafType.Object) {
			return "object";
		}

		return "null";
	}

	/** Indica se esta folha possui valor nulo. */
	get isNull(): bool {
		return this.leafType === LeafType.Null;
	}

	/** Indica se esta folha é uma string. */
	get isString(): bool {
		return this.leafType === LeafType.String;
	}

	/** Indica se esta folha é um número. */
	get isInt32(): bool {
		return this.leafType === LeafType.Int32;
	}

	/** Indica se esta folha é um booleano. */
	get isBool(): bool {
		return this.leafType === LeafType.Bool;
	}

	/** Indica se esta folha é um objeto. */
	get isObject(): bool {
		return this.leafType === LeafType.Object;
	}

	/** Valor desta folha, considerado nulo. */
	get nullValue(): null {
		return null;
	}

	/** Valor desta folha, considerado nulo. */
	set nullValue(value: null) {
		this._leafType = LeafType.Null;
		this._stringValue = null;
		this._int32Value = null;
		this._children = null;
	}

	/** Valor desta folha, considerado string. */
	get stringValue(): string | null {
		if (this.leafType === LeafType.String) {
			return this._stringValue;
		}

		return null;
	}

	/** Valor desta folha, considerado string. */
	set stringValue(value: string | null) {
		this._leafType = value !== null ? LeafType.String : LeafType.Null;
		this._stringValue = value;
		this._int32Value = null;
		this._children = null;
	}

	/** Valor desta folha, considerado número. */
	get int32Value(): i32 | null {
		if (this.leafType === LeafType.Int32) {
			return this._int32Value;
		}

		return null;
	}

	/** Valor desta folha, considerado número. */
	set int32Value(value: i32 | null) {
		this._leafType = value !== null ? LeafType.Int32 : LeafType.Null;
		this._stringValue = null;
		this._int32Value = value;
		this._children = null;
	}

	/** Valor desta folha, considerado booleano. */
	get boolValue(): bool | null {
		if (this.leafType === LeafType.Bool) {
			return (this._int32Value as i32) === 0;
		}

		return null;
	}

	/** Valor desta folha, considerado booleano. */
	set boolValue(value: bool | null) {
		this._leafType = value !== null ? LeafType.Bool : LeafType.Null;
		this._stringValue = null;
		this._int32Value = value === true ? 0 : 1;
		this._children = null;
	}

	/** Valor desta folha, considerado objeto. */
	get children(): Leaf[] | null {
		if (this.leafType === LeafType.Object) {
			return this._children;
		}

		return null;
	}

	/** Valor desta folha, considerado objeto. */
	set children(value: Leaf[] | null) {
		this._leafType = value !== null ? LeafType.Object : LeafType.Null;
		this._stringValue = null;
		this._int32Value = null;
		this._children = value;
	}

	/**
	 * Obtém o valor desta folha em formato de texto.
	 * 
	 * @returns {string}
	 */
	toString(): string {
		// Caso seja uma string, seu valor será formatado primeiro...
		if (this.isString && this.stringValue !== null) {
			const content: string = this.stringValue as string;
			const escapes: string[] = ["\'", "\"", "\n", "\r", "\t", "\b", "\f"];
			const formats: string[] = ["\\\'", "\\\"", "\\n", "\\r", "\\t", "\\b", "\\f"];

			// Conteúdo formatado.
			let fmt: string = "";

			// Percorrer e substituir caracteres de escape...
			for (let i: i32 = 0; i < content.length; i += 1) {
				const char: string = content.charAt(i);
				const escape: i32 = escapes.indexOf(char);

				fmt += escape >= 0 ? formats[escape] : char;
			}

			return fmt;
		}

		// Caso seja um número, seu valor apenas será convertido em string...
		else if (this.isInt32 && this.int32Value !== null) {
			return (this.int32Value as i32).toString();
		}

		// Caso seja um booleano, seu valor apenas será convertido em string...
		else if (this.isBool && this.boolValue !== null) {
			return (this.boolValue as bool).toString();
		}

		// Caso seja um objeto, é exibido apenas seu tipo, similar ao JavaScript...
		else if (this.isObject && this.children !== null) {
			return "[Object Object]";
		}

		return "null";
	}

	/**
	 * Transforma o conteúdo desta folha em um texto equivalente a um JSON.
	 * 
	 * @returns {string}
	 */
	toJSON(): string {
		// Resultado a ser retornado.
		let result: string = "";

		// Caso seja uma string, formatar valor entre aspas...
		if (this.isString && this.stringValue !== null) {
			result += `"${this.toString()}"`;
		}

		// Caso seja um número, manter formatação original...
		else if (this.isInt32 && this.int32Value !== null) {
			result += `${this.toString()}`;
		}

		// Caso seja um booleano, manter formatação original...
		else if (this.isBool && this.boolValue !== null) {
			result += `${this.toString()}`;
		}

		// Caso seja um objeto, converter recursivamente...
		else if (this.isObject && this.children !== null) {
			const content: Leaf[] = this.children as Leaf[];
			let fmt: string = "";

			// Converter valores...
			for (let i: i32 = 0; i < content.length; i += 1) {
				const item: Leaf = content[i];
				fmt += `${item.toJSON()}${i < content.length - 1 ? "," : ""}`;
			}

			result = fmt;
		}

		// Caso não seja nenhum dos demais tipos, seu valor é considerado nulo...
		else {
			result += "null";
		}

		return `[${result}]`;
	}
}
