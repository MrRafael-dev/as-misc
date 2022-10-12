import { SMap, SPair } from "../mapping";

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

  /** Indica se este objeto é válido. */
  isValid: bool;
}

/**
 * @class WebURL
 * 
 * @description
 * Implementação de uma URL básica.
 */
export class WebURL implements WebURLInterface {
  protocol: string;
  username: string;
  password: string;
  href: string;
  origin: string;
  host: string;
  port: i32;
  hostname: string;
  pathname: string;
  search: string;
  searchParams: SMap;
  hash: string;
  isValid: bool;

  /**
   * @constructor
   * 
   * @param protocol Protocolo da URL.
   * @param username Credenciais de usuário.
   * @param password Credenciais de senha.
   * @param href Endereço literal.
   * @param origin Origem do destino.
   * @param host Host.
   * @param port Porta.
   * @param pathname Rota.
   * @param search Parâmetros de busca, em formato de texto.
   * @param searchParams Parâmetros de busca.
   * @param hash Âncora.
   * @param isValid Indica se a URL é válida.
   */
  constructor(protocol: string = "", username: string = "", password: string = "", href: string = "", origin: string = "", host: string = "", port: i32 = 0, pathname: string = "", search: string = "", searchParams: SMap = new SMap(), hash: string = "", isValid: bool = false) {
    this.protocol = protocol;
    this.username = username;
    this.password = password;
    this.href = href;
    this.origin = origin;
    this.host = host;
    this.port = port;
    this.hostname = `${host}:${port}`;
    this.pathname = pathname;
    this.search = search;
    this.searchParams = searchParams;
    this.hash = hash;
    this.isValid = isValid;
  }

  /**
   * Cria um mapa a partir dos parâmetros de busca de uma URL.
   *
   * @param value Parâmetros de busca (separados por `?`).
   *
   * @returns {SMap}
   */
  static parseSearchParams(value: string): SMap {
    // Resultado e array de parâmetros.
    const result: SMap = new SMap();
    const params: string[] = value.split("&");

    // Percorrer e organizar parâmetros...
    for (let i: i32 = 0; i < params.length; i += 1) {
      const param: string = params[i];
      const separator: i32 = param.indexOf("=");

      const key: string = param.substring(i === 0 && param.startsWith("?") ? 1 : 0, separator >= 0 ? separator : param.length);
      const value: string = separator >= 0 ? param.substring(separator + 1, param.length) : "";

      result.set(key.length > 0 ? key : "", value);
    }

    return result;
  }

  /**
   * Instancia um objeto a partir de uma URL em texto.
   * 
   * @param raw URL em texto.
   * 
   * @returns {WebURL}
   */
  static from(raw: string): WebURL {
    // LUT de caracteres válidos.
    const tcpCharset: string = "0123456789abcdefghijklmnopqrstuvwxyz-_.~";

    // Separador do protocolo.
    const protocolSeparator: i32 = raw.indexOf("//");

    // Toda URL deve iniciar com um protocolo. Caso não inicie, esta é uma
    // URL inválida:
    if (protocolSeparator < 0) {
      return new WebURL();
    }

    // Protocolo e URL.
    const protocol: string = raw.substring(0, protocolSeparator);

    // URL, origem, credenciais da rota e âncora.
    let url: string = raw.substring(protocol.length + 2, raw.length);
    let origin: string = `${protocol}//`;
    let username: string = "";
    let password: string = "";
    let hash: string = "";

    // URLs não podem iniciar com "%"...
    if (url.startsWith("%")) {
      return new WebURL();
    }

    // Separador da âncora.
    const hashSeparator: i32 = url.indexOf("#");

    // Dividir âncora da URL...
    if (hashSeparator >= 0) {
      hash = url.substring(hashSeparator + 1, url.length);
      url = url.substring(0, hashSeparator);
    }

    // Parâmetros de busca.
    const querySeparator: i32 = url.indexOf("?");
    let searchParams: SMap = new SMap();

    // Dividir parâmetros de busca da URL...
    if (querySeparator >= 0) {
      const queryStrings: string = url.substring(querySeparator + 1, url.length);
      url = url.substring(0, querySeparator);

      // Salvar parâmetros de busca...
      searchParams = this.parseSearchParams(queryStrings);
    }

    // Rotas da URL e primeira rota.
    const paths: string[] = url.split("/");
    const firstPath: string = paths[0];

    // A primeira rota é especial por poder possuir uma série de credenciais antes dela.
    const credentialsSeparator: i32 = firstPath.indexOf("@");

    // Dividir credenciais da URL...
    if (credentialsSeparator >= 0) {
      // Credenciais e separador de usuário e senha.
      const credentials: string = firstPath.substring(0, credentialsSeparator);
      const usernameSeparator: i32 = credentials.indexOf(":");

      // Dividir usuário e senha, caso possua um separador ":"...
      if (usernameSeparator >= 0) {
        username = credentials.substring(0, usernameSeparator);
        password = credentials.substring(usernameSeparator + 1, credentials.length);
      }
      // ...caso não exista, assume-se que seja apenas o usuário:
      else {
        username = credentials;
      }

      // Separar credenciais da origem:
      origin += firstPath.substring(credentialsSeparator + 1, firstPath.length);
    }

    // Caso não existam credenciais, concatenar a primeira rota inteira.
    else {
      origin += firstPath;
    }

    // Endereço literal.
    let href: string = origin;

    // Host, representação da porta, porta e rotas.
    let host: string = origin.substring(protocolSeparator + 2, origin.length);
    let portString: string = "80";
    let port: i32 = 80;
    let pathname: string = "";

    // Separador de porta para o host.
    const indexOfPort: i32 = host.indexOf(":");

    // Separar host e porta...
    if (indexOfPort >= 0) {
      portString = host.substring(indexOfPort + 1, host.length);
      host = host.substring(0, indexOfPort);

      // Números válidos para a porta.
      const portStringNumbers: string = "0123456789";

      // Embora seja incomum verificar um inteiro desta maneira, isto é necessário
      // porque a função `parseInt()` não leva em consideração todos os fatores.
      //
      // Por exemplo: `parseInt("80 ")` é válido, mas invalidará uma URL.
      for (let i: i32 = 0; i < portString.length; i += 1) {
        const char: string = portString.charAt(i);

        if (portStringNumbers.indexOf(char) < 0) {
          return new WebURL();
        }
      }

      // Identificar endereços IPv6...
      if (host.startsWith("[")) {
        if (!host.endsWith("]")) {
          return new WebURL();
        }

        // Dividir endereço...
        const ipv6String = host.substring(1, host.length - 1);
        const ipv6StringParts = ipv6String.split(":");

        // Um endereço IPv6 pode possuir entre 2 a 8 separadores. Qualquer 
        // outro valor fora desta distância invalidará a URL.
        if (ipv6StringParts.length < 2 || ipv6StringParts.length > 8) {
          return new WebURL();
        }

        // Endereços IPv6 não estão implementados no momento.
        return new WebURL();
      }

      // Converter porta para um número.
      const parsedPort: f64 = parseInt(portString);

      // Uma checagem extra é feita. Falhar ao possuir um número invalidará a URL.
      if (isNaN(parsedPort)) {
        return new WebURL();
      }

      // Obter número da porta:
      port = parsedPort as i32;
    }

    // Percorrer rotas (exceto a primeira)...
    for (let i: i32 = 1; i < paths.length; i += 1) {
      const path: string = paths[i];

      // A rota será recodificada...
      let formattedPath: string = "";

      // Valores usados para tratar codificação de URL ("%").
      let foundPercentCode: bool = false;
      let percentCodeCursor: i32 = 0;
      let percentCode: Uint8Array = new Uint8Array(2);

      // Percorrer caracteres da rota para validação...
      for (let j: i32 = 0; j < path.length; j += 1) {
        const char: string = path.charAt(j);
        const code: i32 = char.charCodeAt(0);

        // Verificar se o caractere é válido:
        const indexOfChar: i32 = tcpCharset.indexOf(char.toLowerCase());

        // Modo de codificação de URL...
        if (foundPercentCode) {

          // A codificação utiliza dois caracteres alfanuméricos que 
          // representam um valor hexadecimal.
          //
          // Por exemplo: " " (espaço) é representado por "%20".
          if (percentCodeCursor < 2) {
            // A LUT de caracteres está organizada especificamente
            // para que o índice dos caracteres tenha o mesmo valor
            // de sua representação.
            //
            // Caracteres que não estiverem entre 0x0 e 0xF
            // invalidarão a URL.
            if (indexOfChar < 0 || indexOfChar > 15) {
              return new WebURL();
            }

            // Concatenar caracteres numéricos...
            percentCode[percentCodeCursor] = indexOfChar;
            percentCodeCursor += 1;
          }
          else {
            // Codificações de apenas uma unidade possuem apenas
            // os primeiros 127 caracteres válidos. Qualquer valor 
            // acima deste invalidará a URL.
            //
            // Valores maiores que 127 *podem* existir, mas por
            // questões de simplicidade, apenas estes serão
            // suportados no momento, e os demais invalidarão a URL.
            if (percentCode[0] > 127) {
              return new WebURL();
            }
          }
        }
        // Concatenar caracteres...
        else if (indexOfChar >= 0) {
          formattedPath += char;
        }
        else {
          // Interpretar partes codificadas...
          if (char === "%") {
            foundPercentCode = true;
            percentCodeCursor = 0;
            continue;
          }

          // Codificar caractere para URL ("%")...
          else if (code <= 127) {
            formattedPath += `%${code.toString(16).padStart(2, "0")}`;
          }

          // Embora seja possível converter caracteres maiores que
          // 127, por questões de simplicidade, esta não será
          // suportada no momento.
          // 
          // Por enquanto, a URL será invalidada.
          else {
            return new WebURL();
          }
        }
      }

      // Concatenar rota...
      pathname += `/${formattedPath}`;
      href += `/${formattedPath}`;
    }

    // Parâmetros de busca, em formato de texto.
    let search: string = "";

    // Formar parâmetros de busca novamente...
    if (searchParams.size > 0) {
      let searchPairs: SPair[] = searchParams._entries();
      search += "?";

      // Concatenar todos os parâmetros de busca...
      for (let i: i32 = 0; i < searchPairs.length; i += 1) {
        const pair: SPair = searchPairs[i];
        search += `${i === 0 ? "" : "&"}${SMap.keyOf(pair)}=${SMap.valueOf(pair)}`;
      }
    }

    // A URL será remontada a partir do conteúdo filtrado.
    // Começando pelos parâmetros de busca...
    href += search;

    // Concatenar de volta a âncora...
    if (hashSeparator >= 0) {
      href += `#${hash}`;
    }

    return new WebURL(protocol, username, password, href, origin, host, port, pathname, search, searchParams, hash, true);
  }
}
