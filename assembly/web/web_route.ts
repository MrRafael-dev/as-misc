import { SMap } from "../mapping";
import { WebURL } from "./web_url";

/**
 * @class WebRoute
 * 
 * @description
 * Representação de uma rota. É mais simples que o tipo `WebURL`, possuindo
 * apenas informações de parâmetros e tipos.
 * 
 * Seu uso é direcionado ao roteador, que pode ter rotas validadas utilizando
 * a função `match()`.
 */
export class WebRoute {
  /** Indica se o resultado da checagem foi válido. */
  isValid: bool;

  /** Mapa de propriedades. */
  params: SMap;

  /** Mapa de parâmetros de busca (iniciados por `?`). */
  searchParams: SMap;

  /** Âncora. */
  hash: string;

  /**
   * @constructor
   * 
   * @param isValid Indica se o resultado da checagem foi válido.
   * @param map Mapa de propriedades.
   * @param params Mapa de parâmetros de busca (iniciados por `?`).
   * @param anchor Âncora.
   */
  constructor(isValid: bool, map: SMap, params: SMap, anchor: string) {
    this.isValid = isValid;
    this.params = map;
    this.searchParams = params;
    this.hash = anchor;
  }

  /**
   * Verifica se uma determinada rota é válida.
   * 
   * @param path Caminho da rota.
   * 
   * @returns {WebRoute}
   */
  static match(reference: string, path: string): WebRoute {
    // Obter parâmetros de busca e de âncora...
    const qindex: i32 = reference.indexOf("?");
    const hindex: i32 = reference.indexOf("#");

    // Separar parâmetros especiais da rota...
    const rindex: i32 = Math.min(qindex, hindex) as i32;
    const rpath: string = path.substring(0, rindex >= 0 ? rindex : path.length);

    // Separar parâmetros de busca e âncora...
    const searchParamString: string = qindex >= 0 ? path.substring(qindex + 1, path.length) : "";
    const hashString: string = hindex >= 0 ? path.substring(hindex + 1, path.length) : "";

    // Separar caminhos...
    const selfRoutes: string[] = reference.split("/");
    const matchRoutes: string[] = rpath.split("/");

    // Determinar o tamanho mínimo para iterar sobre eles...
    const mapSize: i32 = Math.min(selfRoutes.length, matchRoutes.length) as i32;

    // Variáveis que compõem o resultado:
    let isValid: boolean = true;
    let params: SMap = new SMap();

    // Percorrer caminhos...
    for (let i: i32 = 0; i < mapSize; i += 1) {
      const selfMap: string = selfRoutes[i].trim();
      const matchMap: string = matchRoutes[i].trim();
      const pipeSeparator: i32 = selfMap.indexOf("|");

      // Separar propriedades...
      if (selfMap.startsWith(":")) {
        const key: string = selfMap.substring(1, selfMap.length);
        params.set(key.length > 1 ? key : "_", decodeURIComponent(matchMap));
      }

      // Comparar múltiplos...
      else if (pipeSeparator >= 0) {
        const pipes: string[] = selfMap.split("|");
        let equals: bool = true;

        // Quando o operador "|" é usado, múltiplos valores serão comparados de
        // uma vez. O caminho deve atender ao menos um destes valores...
        for (let i: i32 = 0; i < pipes.length; i += 1) {
          const pipe: string = pipes[i].trim();
          equals = pipe === matchMap;

          // Concluir comparação ao encontrar o primeiro resultado exato...
          if (equals) {
            break;
          }
        }

        // Validar comparação feita com o operador "|"...
        if (equals === false) {
          isValid = false;
          break;
        }
      }

      // Validar wildcard...
      else if (selfMap === "*") {
        isValid = true;
        break;
      }

      // Seguir adiante...
      else if (selfMap === matchMap) {
        continue;
      }

      // Invalidar caminho...
      else {
        isValid = false;
        break;
      }
    }

    return new WebRoute(
      isValid,
      params,
      WebURL.parseSearchParams(searchParamString),
      hashString
    );
  }
}
