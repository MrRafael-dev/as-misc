/** Representa um par de chave-valor. Equivale ao tipo `string[]`. */
export type SPair = string[];

/**
 * @class SMap
 * @extends Map
 * 
 * @description
 * Representa um mapa capaz de salvar vários pares de chave-valor. Equivale ao
 * tipo `Map<string, string>`.
 */
export class SMap extends Map<string, string> {
  /**
   * @constructor
   * 
   * @param pairs Pares de chave-valor.
   */
  constructor(pairs: SPair[] = []) {
    super();
    this.bulk(pairs);
  }

  /**
   * Verifica se uma chave existe neste mapa.
   * 
   * @param key Chave.
   * 
   * @returns {bool}
   */
  _has(key: string): bool {
    return this.has(key);
  }

  /**
   * Insere ou altera o valor de uma chave.
   * 
   * @param key Chave.
   * @param value Valor.
   * 
   * @returns {this}
   */
  _set(key: string, value: string): this {
    this.set(key, value);
    return this;
  }

  /**
   * Coleta o valor de uma chave.
   * 
   * @param key Chave.
   * 
   * @returns {string}
   */
  _get(key: string): string {
    return this._has(key) ? this.get(key) as string : "";
  }

  /**
   * Apaga uma chave.
   * 
   * @param key Chave.
   * 
   * @returns {bool}
   */
  _delete(key: string): bool {
    return this.delete(key);
  }

  /**
   * Apaga todas as chaves.
   * 
   * @returns {this}
   */
  _clear(): this {
    this.clear();
    return this;
  }

  /**
   * Insere ou modifica múltiplos pares de chave-valor de uma vez.
   * 
   * @param pairs Pares de chave-valor.
   * 
   * @returns {this}
   */
  bulk(pairs: SPair[]): this {
    // Inserir valores...
    for (let i: i32 = 0; i < pairs.length; i += 2) {
      const pair: SPair = pairs[i];
      this._set(SMap.keyOf(pair), SMap.valueOf(pair));
    }

    return this;
  }

  /**
   * Apaga múltiplas chaves de uma vez.
   * 
   * @param keys Chaves.
   * 
   * @returns {bool[]}
   */
  drop(keys: string[]): bool[] {
    // Resultado a ser retornado.
    const result: bool[] = new Array<bool>(keys.length);

    // Apagar chaves...
    for (let i: i32 = 0; i < keys.length; i += 1) {
      const key: string = keys[i];
      result.push(this._delete(key));
    }

    return result;
  }

  /**
   * Coleta múltiplos pares de chave-valor de uma vez.
   * 
   * @param keys Chaves.
   * 
   * @returns {SPair[]}
   */
  getByKey(keys: string[]): SPair[] {
    // Resultado a ser retornado.
    const result: SPair[] = new Array<SPair>(keys.length);

    // Coletar valores...
    for (let i: i32 = 0; i < keys.length; i += 2) {
      const key: string = keys[i];
      result[i] = SMap.pair(
        keys[i],
        this._get(keys[i])
      );
    }

    return result;
  }

  /**
   * Obtém uma array contendo todas as chaves deste mapa.
   * 
   * @returns {string[]}
   */
  _keys(): string[] {
    return [...this.keys()];
  }

  /**
   * Obtém uma array contendo todos os valores deste mapa.
   * 
   * @returns {string[]}
   */
  _values(): string[] {
    return [...this.values()];
  }

  /**
   * Obtém todo o conteúdo deste mapa em pares de chave-valor.
   * 
   * @returns {SPair[]}
   */
  _entries(): SPair[] {
    // Chaves e valores deste mapa.
    const keys: string[] = this._keys();
    const values: string[] = this._values();

    // Resultado a ser retornado.
    const result: SPair[] = new Array<SPair>(keys.length);

    // Percorrer chaves e valores...
    for (let i: i32 = 0; i < keys.length; i += 1) {
      const key: string = keys[i];
      const value: string = values[i];

      result[i] = SMap.pair(key, value);
    }

    // Retornar pares:
    return result;
  }

  /**
   * Clona este mapa.
   * 
   * @returns {SMap}
   */
  clone(): SMap {
    // Resultado a ser retornado.
    const result: SMap = new SMap();

    // Chaves e valores deste mapa.
    const keys: string[] = this._keys();
    const values: string[] = this._values();

    // Percorrer chaves e valores...
    for (let i: i32 = 0; i < keys.length; i += 1) {
      const key: string = keys[i];
      const value: string = values[i];

      result._set(key, value);
    }

    // Retornar clone:
    return result;
  }

  /**
   * Forma e retorna um par de chave-valor.
   * 
   * @param key Chave.
   * @param value Valor.
   * 
   * @returns {SPair}
   */
  static pair(key: string = "", value: string = ""): SPair {
    return [key, value];
  }

  /**
   * Obtém a chave de um par.
   * 
   * @param pair Par.
   * 
   * @returns {string}
   */
  static keyOf(pair: SPair): string {
    return pair.length > 0 ? pair[0] : "";
  }

  /**
   * Obtém o valor de um par.
   * 
   * @param pair Par.
   * 
   * @returns {string}
   */
  static valueOf(pair: SPair): string {
    return pair.length > 1 ? pair[1] : "";
  }
}
