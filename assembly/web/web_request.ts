import { SMap } from "../mapping";
import { WebURLInterface } from "./web_url";

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
  /** Indica se a requisição é válida. */
  isValid: bool;

  /** Método da requisição. */
  method: string;

  /** Objeto de URL. */
  url: WebURLInterface;

  /** Cabeçalhos da requisição. */
  headers: SMap;

  /** Corpo da requisição. */
  body: Uint8Array;
}

/**
 * @class WebRequest
 * 
 * @description
 * Implementação de uma requisição básica.
 */
export abstract class WebRequest implements WebRequestInterface {
  isValid: bool;
  method: string;
  url: WebURLInterface;
  headers: SMap;
  body: Uint8Array;

  /**
 * @constructor
 * 
 * @param isValid Indica se a requisição é válida.
 * @param method Método da requisição.
 * @param url Objeto de URL.
 * @param headers Cabeçalhos da requisição.
 * @param body Corpo da requisição.
 */
  constructor(isValid: bool = false, method: string, url: WebURLInterface, headers: SMap = new SMap(), body: Uint8Array = new Uint8Array(0)) {
    this.isValid = isValid;
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = headers;
    this.body = body;
  }
}