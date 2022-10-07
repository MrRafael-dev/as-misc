import { SMap } from "../map";

/**
 * @interface WebURLInterface
 * 
 * @description
 * Representação essencial de uma URL.
 * 
 * Esta pode ser utilizada para codificar e decodificar valores recebidos de
 * uma requisição, como parâmetros de busca e âncora.
 */
export interface WebURLInterface {
  /** Indica se este objeto é válido. */
  isValid: bool;

  /** Protocolo da URL. */
  protocol: string;

  /** Credenciais de usuário. */
  username: string;

  /** Credenciais de senha. */
  password: string;

  /** Endereço literal. */
  href: string;

  /** Origem do destino. */
  origin: string;

  /** Host. */
  host: string;

  /** Porta. */
  port: i32;

  /** Rota. */
  pathname: string;

  /** Parâmetros de busca. */
  searchParams: SMap;

  /** Âncora. */
  hash: string;
}

/**
 * @class WebURL
 * 
 * @description
 * Implementação de uma URL básica.
 */
export abstract class WebURL implements WebURLInterface {
  isValid     : bool;
  protocol    : string;
  username    : string;
  password    : string;
  href        : string;
  origin      : string;
  host        : string;
  port        : number;
  pathname    : string;
  searchParams: SMap;
  hash        : string;
  
  /**
   * @constructor
   * 
   * @param isValid Indica se este objeto é válido.
   * @param protocol Protocolo da URL.
   * @param username Credenciais de usuário.
   * @param password Credenciais de senha.
   * @param href Endereço literal.
   * @param origin Origem do destino.
   * @param host Host.
   * @param port Porta.
   * @param pathname Rota.
   * @param searchParams Parâmetros de busca.
   * @param hash Âncora.
   */
  constructor(isValid: bool = false, protocol: string = "", username: string = "", password: string = "", href: string = "", origin: string = "", host: string = "", port: i32 = 0, pathname: string = "", searchParams: SMap = new SMap(), hash: string = "") {
    this.isValid      = isValid;
    this.protocol     = protocol;
    this.username     = username;
    this.password     = password;
    this.href         = href;
    this.origin       = origin;
    this.host         = host;
    this.port         = port;
    this.pathname     = pathname;
    this.searchParams = searchParams;
    this.hash         = hash;
  }
}