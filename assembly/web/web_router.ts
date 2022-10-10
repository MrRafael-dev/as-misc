import { SMap } from "../mapping";
import { WebURL } from "./web_url";

/**
 * @class WebRouteParams
 * 
 * @description
 * Representa um resultado de rota.
 */
export class WebRouteParams {
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
}

/**
* @class WebRoute
* 
* @description
* 
*/
export class WebRoute {
  /** Caminho da rota. */
  path: string;

  /**
   * @constructor
   * 
   * @param path Caminho da rota.
   */
  constructor(path: string) {
    this.path = path;
  }

  /**
   * Verifica se uma determinada rota é válida.
   * 
   * @param path Caminho da rota.
   * 
   * @returns {WebRouteParams}
   */
  match(path: string): WebRouteParams {
    // Obter parâmetros de busca e de âncora...
    const qindex: i32 = this.path.indexOf("?");
    const hindex: i32 = this.path.indexOf("#");

    // Separar parâmetros especiais da rota...
    const rindex: i32 = Math.min(qindex, hindex) as i32;
    const rpath: string = this.path.substring(0, rindex >= 0 ? rindex : this.path.length);

    // Separar parâmetros de busca e âncora...
    const searchParamString: string = qindex >= 0 ? this.path.substring(qindex + 1, this.path.length) : "";
    const hashString: string = hindex >= 0 ? this.path.substring(hindex + 1, this.path.length) : "";

    // Separar caminhos...
    const selfRoutes: string[] = this.path.split("/");
    const matchRoutes: string[] = rpath.split("/");

    // Determinar o tamanho mínimo para iterar sobre eles...
    const mapSize: i32 = Math.min(selfRoutes.length, matchRoutes.length) as i32;

    // Variáveis que compõem o resultado:
    let isValid: boolean = true;
    let params: SMap = new SMap();

    // Percorrer caminhos...
    for (let i: i32 = 0; i < mapSize; i += 1) {
      const selfMap: string = selfRoutes[i];
      const matchMap: string = matchRoutes[i];

      // Separar propriedades...
      if (selfMap.startsWith(":")) {
        const key: string = selfMap.substring(1, selfMap.length);
        params.set(key.length > 1 ? key : "_", decodeURIComponent(matchMap));
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

    return new WebRouteParams(
      isValid,
      params,
      WebURL.parseSearchParams(searchParamString),
      hashString
    );
  }
}
