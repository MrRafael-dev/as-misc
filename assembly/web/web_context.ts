import { WebRequest } from "./web_request"
import { WebResponse } from "./web_response"

interface WebContextInterface {
}

type WebRequestHandler = (ctx: WebContext, req: WebRequest, res: WebResponse) => void;

export class WebContext implements WebContextInterface {
	host: string;
	port: i32;
	handlers: WebRequestHandler[];

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