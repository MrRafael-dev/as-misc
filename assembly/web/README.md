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
and received on a way which *AssemblyScript* can already do by default. As long as our
structures are simple enough, we should be able to send and receive data between 
them without much trouble.

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

However, *AssemblyScript* is capable of transfering simple object structures, 
as long as they don't have a constructor. With this, we can create a data 
transfer object to send and receive data from and to *Node.js* and *AssemblyScript*.

```typescript
/** AssemblyScript. */
class Warrior {
  name!: string;
  coins!: i32;
}

export function giveCoins(warrior: Warrior): Warrior {
  warrior.coins += 100;
  return warrior;
}

export function createWarrior(name: string, coins: i32): Warrior {
  return {name: name, coins: coins} as Warrior;
}

/** JavaScript */
import { giveCoins, createWarrior } from "./assemblyscript.js";

let mainCharacter = {
  name: "Ephesius Crassinus",
  coins: 0
};

// Update and rewrite old object with a copy...
mainCharacter = giveCoins(mainCharacter);

// Create another object.
let sideCharacter = createWarrior("Athaulf Bradleye", 0);
```

## Transfer format

By using the concept we saw above, we can make a simple object structure to transfer
data between the host and *AssemblyScript*. By default, `as-misc` provides two 
data structures,`WebRequestData` and `WebResponseData`.

Headers and search parameters will be sent as a 2D array, which is how `Map` objects
strucutre their data when using `map.entries()`. For the *web* module, we use an
extended object called `SMap`.

```typescript
const missions: SMap = new SMap([
	["Ephesius Crassinus", "Protect the kingdom."],
	["Athaulf Bradleye", "Send troops for an invasion."],
	["Reidun", "Deliver a recipe to the old wizard."]
]);

missions._entries();
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
	port: 8080,
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
		body = Buffer.concat(body);

		// All data will now be passed for AssemblyScript.It's up to WebAssembly
		// to handle the response, Node.js will only serve as a bridge...
		const responseAS = listen({
			method: method,
			url: url,
			headers: headers,
			body: body,
			searchParams: searchParams
		});

		// Set response headers...
		for(const header of responseAS.headers) {
			const key   = header[0];
			const value = header[1];

			response.setHeader(key, value);
		}

		// Take ArrayBuffer sent from AssemblyScript...
		const bodyAS = new Uint16Array(responseAS.body);
		let responseBody = "";

		// Decode UTF-16 string...
		for(const byte of bodyAS) {
			responseBody += String.fromCharCode(byte);
		}

		// Write response...
		response.write(responseBody);
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
 * @param reqData Web request transfer object.
 * 
 * @returns {WebResponseData}
 */
export function listen(reqData: WebRequestData): WebResponseData {
  // Create a Request object with the content sent.
  //
  // Notice how we have to encode the body to an ArrayBuffer. This is because
  // a response body can be pretty much anything. If the user upload a file,
  // for example, then the request body will have to be handled as binary data.
  const req: WebRequest = new WebRequest().import(reqData);

  // Create an empty Response object.
  //
  // Response values can be modified along the middleware layers. We'll pass
  // a reference of this object through the context and take all the changes
  // back.
  const res: WebResponse = new WebResponse();
  
  // Pass Request and Response objects to the context. From here,
  // AssemblyScript will do all the work of a web server...
  //
  // In the end, all data will be sent back as an transfer object.
  return app.listen(req, res).export();
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
