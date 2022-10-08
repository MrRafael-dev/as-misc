import { SMap, SPair } from "../mapping";

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
}