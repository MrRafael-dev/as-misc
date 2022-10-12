import { WebRequest } from "./web_request"
import { WebResponse } from "./web_response"

/** Representa um evento de requisição. Equivale ao tipo `(ctx: WebContext, req: WebRequest, res: WebResponse) => void`. */
export type WebRequestHandler = (ctx: WebContext, req: WebRequest, res: WebResponse) => void;

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

	use(handler: WebRequestHandler): this {
		this.handlers.push(handler);
		return this;
	}

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