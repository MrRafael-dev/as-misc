import { SMap } from "../map";

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
  /** Indica se este objeto é válido. */
  isValid: boolean;

  /** URL indicativa de resposta. */
  url: string;

  /** Status da resposta. */
  status: i32;

  /** Cabeçalhos da resposta. */
  headers: SMap;

  /** Corpo da resposta. */
  body: Uint8Array;

  /** Indica se isto deve ser interpretado como um redirecionamento. */
  redirected: bool;
}

/**
 * @class WebResponse
 * 
 * @description
 * Implementação de uma resposta básica.
 */
export abstract class WebResponse implements WebResponseInterface {
  isValid   : boolean;
  url       : string;
  status    : i32;
  headers   : SMap;
  body      : Uint8Array;
  redirected: bool;

  /**
   * @constructor
   * 
   * @param status Status da resposta.
   * @param headers Cabeçalhos da resposta.
   * @param body Corpo da resposta.
   * @param redirected Indica se isto deve ser interpretado como um redirecionamento.
   */
  constructor(url: string, status: i32 = 0, headers: SMap = new SMap(), body: Uint8Array = new Uint8Array(0), redirected: bool = false) {
    this.isValid    = true;
    this.url        = url;
    this.status     = status;
    this.headers    = new SMap();
    this.body       = body;
    this.redirected = redirected;    
  }
}