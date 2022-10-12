import { SMap, SPair } from "../mapping";
import { webStatus } from "./web_info";

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
  /** Indica se este objeto pode ser editado. */
  isLocked: bool;

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
  private _isLocked: bool;
  private _status: i32;
  private _url: string;
  private _headers: SMap;
  private _body: ArrayBuffer | null;
  private _redirected: bool;
  private _isValid: bool;

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
    this._isLocked = false;
    this._url = url;
    this._status = status;
    this._headers = new SMap(headers);
    this._body = body;
    this._redirected = redirected;
    this._isValid = isValid;
  }

  lock(): this {
    this._isLocked = true;
    return this;
  }

  unlock(): this {
    this._isLocked = false;
    return this;
  }

  get isLocked(): bool {
    return this._isLocked;
  }

  get url(): string {
    return this._url;
  }

  set url(value: string) {
    if (!this.isLocked) {
      this._url = value;
    }
  }

  get status(): i32 {
    return this._status;
  }

  set status(value: i32) {
    if (!this.isLocked) {
      this._status = value;
    }
  }

  get statusText(): string {
    if (webStatus.has(this.status)) {
      return webStatus.get(this.status) as string;
    }

    return "Unknown Status";
  }

  get headers(): SMap {
    return this._headers;
  }

  set headers(value: SMap) {
    if (!this.isLocked) {
      this._headers = value;
    }
  }

  get body(): ArrayBuffer | null {
    return this._body;
  }

  set body(value: ArrayBuffer | null) {
    if (!this.isLocked) {
      this._body = value;
    }
  }

  get redirected(): bool {
    return this._redirected;
  }

  set redirect(value: bool) {
    if (!this.isLocked) {
      this._redirected = value;
    }
  }

  get isValid(): bool {
    return this._isValid;
  }

  set isValid(value: bool) {
    if (!this.isLocked) {
      this._isValid = value;
    }
  }

  /**
   * 
   * @param headers 
   * @returns 
   */
  setHeaders(headers: SPair[]): this {
    this.headers.bulk(headers);
    return this;
  }

  setStatus(status: i32): this {
    this.status = status;
    return this;
  }

  write(content: string): this {
    this.body = String.UTF16.encode(content);
    return this;
  }
}