import { SMap, SPair } from "../mapping";

/**
 * @interface WebResponseInterface
 * 
 * @description
 * Representação essencial de uma resposta.
 * 
 * Este objeto é processado por um intermediário (um servidor) para empacotar
 * todo o conteúdo essencial de resposta em um formato simples de manipular.
 * 
 * Quando passado para uma ponte de comunicação, seus dados são transformados
 * em uma array de bytes e enviados de volta para o cliente.
 */
export interface WebResponseInterface {
  /** Status da resposta. */
  status: i32;

  /** URL indicativa da resposta. */
  url: string;

  /** Cabeçalhos da resposta. */
  headers: SMap;

  /** Corpo da resposta. */
  body: ArrayBuffer | null;

  /** Indica se isto deve ser interpretado como um redirecionamento. */
  redirected: bool;

  /** Indica se este objeto é válido. */
  isValid: bool;
}

/**
 * @class WebResponse
 * 
 * @description
 * Implementação de uma resposta básica.
 */
export class WebResponse implements WebResponseInterface {
  status: i32;
  url: string;
  headers: SMap;
  body: ArrayBuffer | null;
  redirected: bool;
  isValid: bool;

  /**
   * @constructor
   * 
   * @param status Status da resposta.
   * @param url URL indicativa da resposta.
   * @param headers Cabeçalhos da resposta.
   * @param body Corpo da resposta.
   * @param redirected Indica se isto deve ser interpretado como um redirecionamento.
   * @param isValid Indica se este objeto é válido.
   */
  constructor(status: i32 = 0, url: string = "", headers: SPair[] = [], body: ArrayBuffer | null = null, redirected: bool = false, isValid: bool = true) {
    this.url = url;
    this.status = status;
    this.headers = new SMap(headers);
    this.body = body;
    this.redirected = redirected;
    this.isValid = isValid;
  }

  withHeaders(headers: SPair[]): this {
    this.headers.bulk(headers);
    return this;
  }

  withStatus(status: i32): this {
    this.status = status;
    return this;
  }

  write(content: string): this {
    this.body = String.UTF16.encode(content);
    return this;
  }
}