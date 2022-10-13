import { WebContext, WebRequestHandler } from "./web_context";
import { WebRequest } from "./web_request";
import { WebResponse } from "./web_response";
import { WebRoute } from "./web_route";

/** Representa um evento de requisição. Equivale ao tipo `(ctx: WebContext, req: WebRequest, res: WebResponse, route: WebRoute) => void`. */
type WebRouteHandler = (ctx: WebContext, req: WebRequest, res: WebResponse, route: WebRoute) => void;

/**
 * @class WebRouter
 * 
 * @description
 * Representa um gerenciador de rotas. É uma das partes mais básicas de um
 * servidor, pois permite mapear um website para páginas diferentes e/ou
 * controlar uma API REST.
 * 
 * Esta classe complementa o `WebContext`.
 */
export class WebRouter extends Map<string, WebRouteHandler> {
  /** Evento de requisição utilizado quando uma rota não existir. */
  notFound: WebRequestHandler | null;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.notFound = null;
  }

  /**
   * Escuta.
   * 
   * @param ctx Contexto.
   * @param req Requisição.
   * @param res Resposta.
   */
  handle(ctx: WebContext, req: WebRequest, res: WebResponse): void {
    const path: string = `${req.method.trim()} ${req.url.trim()}`;

    const keys: string[] = this.keys();

    for (let i: i32 = 0; i < keys.length; i += 1) {
      const key: string = keys[i];
      const route: WebRoute = WebRoute.match(key, path);

      if (route.isValid) {
        const handler: WebRouteHandler = this.get(key) as WebRouteHandler;
        return handler(ctx, req, res, route);
      }
    }

    if (this.notFound !== null) {
      const handler: WebRequestHandler = this.notFound as WebRequestHandler;
      return handler(ctx, req, res);
    }

    const handler: WebRequestHandler = (ctx: WebContext, req: WebRequest, res: WebResponse): void => {
      res
        .setStatus(404)
        .setHeaders([
          ["content-type", "application/json; charset=utf-8"]
        ])
        .write(`{"http":404,"status":"error","message":"404 Not Found."}`)
        .lock();
    };

    return handler(ctx, req, res);
  }
}