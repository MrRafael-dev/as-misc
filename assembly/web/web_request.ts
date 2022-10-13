import { SMap, SPair, SPairData } from "../mapping";

/**
 * @interface WebRequestInterface
 * 
 * @description
 * Representação essencial de uma requisição.
 * 
 * Este objeto é retornado a partir de uma ponte de comunicação. Nele, estão
 * contidas várias informações da requisição, como URL, método, parâmetros e 
 * dados passados pelo cliente.
 */
export interface WebRequestInterface {
  /** Método da requisição. */
  method: string;

  /** URL indicativa da requisição. */
  url: string;

  /** Cabeçalhos da requisição. */
  headers: SMap;

  /** Corpo da requisição. */
  body: ArrayBuffer | null;

  /** Parâmetros de busca da requisição. */
  searchParams: SMap;

  /** Indica se a requisição é válida. */
  isValid: bool;
}

/**
 * @class WebRequestData
 * 
 * @description
 * Objeto de transferência. Pode ser usado para transferir dados de requisição
 * entre um intermediário para cá.
 */
export class WebRequestData {
  /** Método da requisição. */
  method!: string;

  /** URL indicativa da requisição. */
  url!: string;

  /** Cabeçalhos da requisição. */
  headers!: SPairData[];

  /** Corpo da requisição. */
  body!: ArrayBuffer | null;

  /** Parâmetros de busca da requisição. */
  searchParams!: SPairData[];

  /** Indica se a requisição é válida. */
  isValid!: bool;
}

/**
 * @class WebRequest
 * 
 * @description
 * Implementação de uma requisição básica.
 */
export class WebRequest implements WebRequestInterface {
  method: string;
  url: string;
  headers: SMap;
  body: ArrayBuffer | null;
  searchParams: SMap;
  isValid: bool;

  /**
   * @constructor
   * 
   * @param method Método da requisição.
   * @param url URL indicativa da requisição.
   * @param headers Cabeçalhos da requisição.
   * @param body Corpo da requisição.
   * @param isValid Indica se a requisição é válida.
   */
  constructor(method: string = "GET", url: string = "", headers: SPair[] = [], body: ArrayBuffer | null = null, searchParams: SPair[] = [], isValid: bool = true) {
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = new SMap(headers);
    this.body = body;
    this.searchParams = new SMap(searchParams);
    this.isValid = isValid;
  }

  /**
   * Importa dados de um objeto de transferência para cá.
   * 
   * @param data Objeto de transferência.
   * 
   * @returns {this}
   */
  import(data: WebRequestData): this {
    this.method       = data.method;
    this.url          = data.url;
    this.headers.import(data.headers);
    this.body         = data.body;
    this.searchParams.import(data.searchParams);
    this.isValid      = this.isValid;

    return this;
  }

  /**
   * Exporta os dados da requisição para um objeto de transferência.
   * 
   * @returns {WebRequestData}
   */
  export(): WebRequestData {
    return {
      method      : this.method,
      url         : this.url,
      headers     : this.headers.export(),
      body        : this.body,
      searchParams: this.searchParams.export(),
      isValid     : this.isValid
    } as WebRequestData;
  }
}