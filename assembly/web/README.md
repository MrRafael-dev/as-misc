# Web Module

This module provides a varying amount of resources related to *web* 
development. When used together, these resources can be used to build a
simple, but functional, *web* interface.

# Getting Started

This part will serve as a guide on how to make a simple *web* server 
interface using `as-misc`'s *web* module and *Node.js*. As a way of introducing
it's elements, everything will be done using only the default HTTP module 
provided by default. There won't be any `npm` dependency, with
the exception of `as-misc` itself.

## Interfacing between *JavaScript* and *AssemblyScript*

*WebAssembly* modules run isolated and can't interact with *JavaScript* 
directly. Not only that, but *WASM* doesn't have access to any of 
*JavaScript*'s features by default, they have to be exported to it.

Because *WebAssembly* relies on it's host to provide it's features, it's 
not possible to have a fully standalone *web* server. We'll either have to
write bindings for a given runtime, or use a specific runtime which already does this.

For this guide, no host bindings will be written. Everything will be sent 
and received through primitive types (e.g. `string`, `number`), which *AssemblyScript* 
already offer by default. As long as we provide structures made of just it's primitive 
types, we should be able to send and receive data between them without much trouble.

```typescript
/** AssemblyScript */
export function getChest(chest: Chest): void {
	// ...
}

export function getWarriors(warriors: string[]): void {
	// ...
}

/** JavaScript. */
import { getChest } from "./assemblyscript.js";

let chest = {
	type: "wood",
	opened: false,
	inventory: [
		{ item: "sword", type: "iron" },
		{ item:  "coin", type: "gold" },
		{ item:  "coin", type: "gold" }
	]
};

let warriors = [
	"Ephesius Crassinus",
	"Athaulf Bradleye",
	"Reidun"
];

/** This won't work... */
getChest(chest);

/** ...but this will. */
getWarriors(warriors);
```

## Transfer format

While *JavaScript* can pass the values we need just fine, *AssemblyScript* will
require a more structured solution in order to do the same. This will be a
problem specially for headers, because `as-misc` retrieves them as a group of
*arrays* ordered in a "key-value" way. This is all done by one class called `SMap`.

```typescript
const missions: SMap = new SMap([
	["Ephesius Crassinus", "Protect the kingdom."],
	["Athaulf Bradleye", "Send troops for an invasion."],
	["Reidun", "Deliver a recipe to the old wizard."]
]);
```

One way we can achieve this is by using a 3D array. And since strings are the 
great majority of our content, we'll convert everything to it. Things like
numbers and JSON can be dealt by *JavaScript* with `parseInt()` and `JSON.parse()`.

Here's our response format:
```jsonc
[
  /*
  	HTTP's first line of response.
    
    -> Version: [0][0][0]
    -> Status : [0][0][1]
    -> Text   : [0][0][2]
   */
  [[
    "HTTP/1.1",
    "200", 
    "OK"
  ]],
    
  /*
    Response headers.
  
    -> headers: [1][...]
  */
  [
		["Content-Type", "text/html; charset=utf-8"],
		["X-Powered-By", "AssemblyScript"]
	],

  /*
    Response body. For now, we'll assume it's always a string.

    -> body: [2][0][0]
  */
  [[
		"<h1>Webpage</h1>"
	]]
]
```

# Hello, world

Now, let's write a very simple example to see it in action.
Don't be afraid ofthe result: I tried to make as easy-to-understand as possible.

## JavaScript (boilerplate)

We'll start with *JavaScript*. *Node.js* will be acting like a middleman, 
but that's it: no routing, no *frameworks*... nothing. From here, we are on our own.

```javascript
import { listen } from "./build/release.js";
import * as http from "http";

/** Default server config. Declared at the top. */
const config = {
	port: 80,
	protocol: "http:"
};

/** Default HTTP server. */
const server = http.createServer();

/** HTTP server address information. */
let info = {
	port: config.port,
	family: "IPv4",
	address: "127.0.0.1"
};

/**
 * Create a `URL` object relative to server path/request.
 * 
 * @param {string} url Request URL.
 * 
 * @returns {URL}
 */
const createURL = (url = "") => {
	const protocol = config.protocol;
	const address  = info.family === "IPv6" ? `[::1]`:	`127.0.0.1`;
	const port     = info.port === 80? "" : `:${info.port}`;	

	return new URL(`${protocol}//${address}${port}${url}`);
};

/**
 * Event triggered when HTTP server starts listening for requests.
 */
const onListening = () => {
	info = server.address();
	console.log(`Server started. Open your browser and open "${createURL()}"`);
};

/**
 * Event triggered when a request is received.
 * 
 * @param {http.IncomingMessage} request Request.
 * @param {http.ServerResponse} response Response.
 */
const onRequest = (request, response) => {
	// Request method and URL (e.g. "GET /index.html").
	const method = request.method;
	const url    = request.url;

	// Request headers.
	const headers = request.headers;
	
	// Requested URL and query parameters.
	const href = createURL(url);
	const searchParams = [...href.searchParams.entries()];

	// Request body. First, it will store it's chunks. Then, it's value will be
	// reassigned to be a string.
	let body = [];

	// Log request...
	console.log(`[${method}] ${url}`);

	// Get body through event handler...
	request.on("data", (chunk) => {
		body.push(chunk);
	});

	// Proceed with rest of request from there...
	request.on("end", () => {
		body = Buffer.concat(body).toString();

		// All data will now be passed for AssemblyScript.It's up to WebAssembly
		// to handle the response, Node.js will only serve as a bridge...
		const rawAS = listen(method, url, headers, body, searchParams);

		// AssemblyScript response data.
		const responseAS = {
			version   : 				 rawAS[0][0][0],
			status    : parseInt(rawAS[0][0][1]),
			statusText: 				 rawAS[0][0][2],
			headers   : 				 rawAS[1],
			body      : 				 rawAS[2][0][0]
		};

		// Set response headers...
		for(const header of responseAS.headers) {
			const key   = header[0];
			const value = header[1];

			response.setHeader(key, value);
		}

		// Write response...
		response.write(responseAS.body);
		response.end();
	});
};

// Start server...
server.on("listening", onListening);
server.on("request", onRequest);
server.listen(config.port);
```

## AssemblyScript (boilerplate)

This is the `listen()` function we'll be using to receive requests from *Node.js*.
The 3D array used for returning responses is also documented here to avoid 
confusion about their indexes.

```typescript
/**
 * Receives a response from JavaScript, handles it, then sends it back.
 * 
 * @param method Method.
 * @param url URL.
 * @param headers Headers.
 * @param body Body.
 * @param searchParams Query parameters.
 * 
 * @returns {string[][][]}
 */
export function listen(method: string, url: string, headers: SPair[], body: string, searchParams: SPair[]): string[][][] {
  // Create a Request object with the content sent.
  //
  // Notice how we have to encode the body to an ArrayBuffer. This is because
  // a response body can be pretty much anything. If the user upload a file,
  // for example, then the request body will have to be handled as binary data.
  const req: WebRequest = new WebRequest(
    method, 
    url, 
    headers, 
    String.UTF16.encode(body), 
    searchParams
  );

  // Create an empty Response object.
  //
  // Response values can be modified along the middleware layers. We'll pass
  // a reference of this object through the context and take all the changes
  // back.
  const res: WebResponse = new WebResponse();
  
  // Pass Request and Response objects to the context. From here,
  // AssemblyScript will do all the work of a web server...
  app.listen(req, res);
  
  // Deconstruct and send the response back as a 3D array.
  //
  // AssemblyScript doesn't support tuples and we can't send objects back to
  // JavaScript. Given thoses limitations, along with choice of not wanting to
  // use host bindings, we have to abuse arrays and default types.
  //
  // Due to the simplicity of our responses, we can simply use strings for 
  // everything. The HTTP status code can be dealt by JavaScript later by
  // using `parseInt()`, while objects can be parsed with `JSON.parse()`.
  //
  // For more complex responses, packing everything on a ArrayBuffer would also
  // work fine.
  return [
    /*
      HTTP's first line of response.
    
      -> Version: [0][0][0]
      -> Status : [0][0][1]
      -> Text   : [0][0][2]
     */
    [[
      "HTTP/1.1",
      res.status.toString(), 
      res.statusText
    ]],
    
    /*
      Response headers. Because `SMap` already returns a 2D array, it doesn't
      need to be enclosed with brackets.
    
      -> headers: [1][...]
    */
    res.headers._entries(),

    /*
      Response body. For now, we'll assume it's always a string.

      -> body: [2][0][0]
    */
    [[
      res.body != null? 
        String.UTF16.decode(res.body as ArrayBuffer)
      : ""
    ]]
  ];
}
```

### Hello, world

And finally, our "*hello world*".

```typescript
import { WebRequest, WebResponse, WebRoute } from "../../as-misc/assembly/web";
import { WebContext } from "../../as-misc/assembly/web/web_context";
import { WebRouter } from "../../as-misc/assembly/web/web_router";
import { SPair } from "./../../as-misc/assembly/mapping";

/** Default `as-misc` HTTP server. */
const app: WebContext = new WebContext("127.0.0.1", 8080);

/** Default `as-misc` router. */
const router: WebRouter = new WebRouter();

// For our first middleware, let's make it handle JSON responses by default.
// Then, within the same function, we'll pass everything through the router.
app.use((ctx: WebContext, req: WebRequest, res: WebResponse): void => {
  res.setHeaders([
    ["Content-Type", "application/json; charset=utf-8"]
  ]);

  router.handle(ctx, req, res);
  }
);

// A simple route.
router.set("GET /", (ctx: WebContext, req: WebRequest, res: WebResponse, route: WebRoute): void => {
  res.setStatus(200)  
     .write(`{"http":200,"status":"success","message":"Hello from AssemblyScript."}`);
});

// Route parameters are supported.
router.set("GET /say/:message", (ctx: WebContext, req: WebRequest, res: WebResponse, route: WebRoute): void => {
  if(route.params.has("message")) {
    const message: string = route.params.get("message") as string;  
    res
    .setStatus(200)
    .write(`{"http":200,"status":"success","message":"${message}"}`);
  }
  else {
    res
    .setStatus(400)
    .write(`{"http":400,"status":"fail","message":"Write something in the route."}`);
  }
});

// Set 404 page no matches are found.
router.notFound = (ctx: WebContext, req: WebRequest, res: WebResponse): void => {
  res
    .setStatus(404)
    .write(`{"http":404,"status":"error","message":"404 Not Found."}`);
};
```
# Conclusion

This is not meant to be production-ready or anything like that.
It was done mostly to experiment with the idea.

Initial efforts aside, this is not and probably won't be the only *web* framework written for this language. For a more complete *web* setup, you may also want to check out these libraries/*frameworks*:
- **[hypertext-as](https://github.com/jtenner/hypertext-as)** is a full HTTP parser. It can receive and parse connections directly from the socket and have *AssemblyScript* handle a *web* server entirely by itself.
- **[as-json](https://github.com/JairusSW/as-json)** is a JSON parser. It can be very useful for processing data sent to the server and to transfer objects between *WebAssembly* and the host.
