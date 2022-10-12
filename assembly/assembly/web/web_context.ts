import { WebRequest } from "./web_request"
import { WebResponse } from "./web_response"

/** Representa um evento de requisição. Equivale ao tipo `(ctx: WebContext, req: WebRequest, res: WebResponse) => void`. */
export type WebRequestHandler = (ctx: WebContext, req: WebRequest, res: WebResponse) => void;

/**
 * @class WebContext
 * 
 * @description
 * Representa um contexto para um servidor. Aqui é implementado um sistema de
 * encadeamento de eventos simples, que podem ser gerenciados à vontade.
 */
export class WebContext {
	/** Host. */
	host: string;

	/** Porta. */
	port: i32;

	/** Eventos de requisição. */
	handlers: WebRequestHandler[];

	/**
	 * @constructor
	 * 
	 * @param host Host.
	 * @param port Porta.
	 */
	constructor(host: string, port: i32) {
		this.host = host;
		this.port = port;
		this.handlers = [];
	}

	/**
	 * Adiciona um novo evento de requisição à pilha.
	 * 
	 * @param handler Evento de requisição.
	 * 
	 * @returns {this}
	 */
	use(handler: WebRequestHandler): this {
		this.handlers.push(handler);
		return this;
	}

	/**
	 * Escuta.
	 * 
	 * @param req Requisição.
	 * @param res Resposta.
	 * 
	 * @returns {WebResponse}
	 */
	listen(req: WebRequest, res: WebResponse = new WebResponse()): WebResponse {
		for (let i: i32 = 0; i < this.handlers.length; i += 1) {
			const handler: WebRequestHandler = this.handlers[i];
			handler(this, req, res);

			if (res.isLocked) {
				break;
			}
		}

		return res;
	}
}