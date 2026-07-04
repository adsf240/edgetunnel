// <!--GAMFC-->version base on commit 58686d5d125194d34a1137913b3a64ddcf55872f, time is 2024-11-27 09:26:01 UTC<!--GAMFC-END-->.
// @ts-ignore
import { connect } from 'cloudflare:sockets';
const speedtestHTML = '<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>CF IP SpeedTest</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui;background:#0d1117;color:#c9d1d9;padding:16px;max-width:660px;margin:0 auto}
h1{color:#58a6ff;font-size:21px;text-align:center;margin:8px 0}
.sub{text-align:center;color:#8b949e;font-size:12px;margin-bottom:14px}
.card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin:12px 0}
.card h3{color:#58a6ff;font-size:14px;margin-bottom:12px}
.cbs{display:flex;flex-wrap:wrap;gap:8px}
.cbs label{display:flex;align-items:center;gap:6px;background:#21262d;border:1px solid #30363d;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;user-select:none}
.cbs label:hover,.cbs label.sel{border-color:#58a6ff;background:#1a2332}
.cbs input{display:none}
.cbs .flag{font-size:16px}
.ctls{display:flex;gap:12px;align-items:center;margin:12px 0;flex-wrap:wrap}
.ctls label{font-size:12px;color:#8b949e}
.ctls select{background:#21262d;border:1px solid #30363d;color:#c9d1d9;border-radius:6px;padding:6px 10px;font-size:13px;min-width:80px}
.btn{display:block;width:100%;padding:14px;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:.2s}
.btn-go{background:#238636;color:#fff}.btn-go:hover{background:#2ea043}.btn-go:disabled{background:#21262d;color:#484f58;cursor:not-allowed}
.btn-blue{background:#1f6feb;color:#fff;margin-top:14px}
.progress{display:none;margin:12px 0}
.progress.show{display:block}
.pbar{height:5px;background:#21262d;border-radius:3px;overflow:hidden}
.pfill{height:100%;background:#58a6ff;border-radius:3px;width:0;transition:width .3s}
.ptxt{text-align:center;font-size:12px;color:#8b949e;margin-top:6px}
table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}
th{text-align:left;padding:8px 6px;color:#8b949e;font-weight:500;font-size:11px;border-bottom:1px solid #21262d}
td{padding:9px 6px;border-bottom:1px solid #21262d;vertical-align:middle}
tr:hover td{background:#1a2332}
.g{color:#3fb950;font-weight:700}.y{color:#d2991d}.r{color:#f85149}
.cp{background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:4px 10px;border-radius:4px;font-size:11px;cursor:pointer;white-space:nowrap}
.cp:hover{background:#30363d}.cp.ok{background:#238636;border-color:#238636;color:#fff}
.cp.bad{background:#da3633;border-color:#da3633;color:#fff}
.empty{text-align:center;padding:40px 20px;color:#8b949e;display:none}.empty.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#238636;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;z-index:99;opacity:0;transition:opacity .3s}
.toast.show{opacity:1}
.counter{font-size:32px;font-weight:700;color:#58a6ff;text-align:center;margin:8px 0}
.ft{text-align:center;color:#484f58;font-size:11px;margin:24px 0}a{color:#58a6ff}
.live{display:inline-block;width:8px;height:8px;background:#3fb950;border-radius:50%;margin-right:6px;animation:pulse 1s infinite}@keyframes pulse{50%{opacity:0.3}}
@media(max-width:400px){td{font-size:11px}.cp{font-size:10px;padding:3px 7px}}
</style>
</head>
<body>
<h1>Cloudflare IP SpeedTest</h1>
<p class="sub"><span class="live"></span>客户端直连测速 · 真实延迟</p>

<div class="card">
<h3>选择地区（多选）</h3>
<div class="cbs" id="cbs"></div>
<div class="ctls">
<label>最少显示</label><select id="ms"><option value="0">不限</option><option value="60">60ms内</option><option value="100">100ms内</option><option value="150">150ms内</option></select>
<label>数量</label><select id="lm"><option value="8">8个</option><option value="12" selected>12个</option><option value="16">16个</option></select>
</div>
<button class="btn btn-go" id="go" onclick="start()">开始测速</button>
</div>

<div class="progress" id="prog">
<div class="pbar"><div class="pfill" id="pf"></div></div>
<div class="ptxt" id="pt">准备中...</div>
</div>
<div class="counter" id="cnt" style="display:none"></div>

<div class="empty" id="empty"><p>没有符合条件的 IP</p><p style="font-size:12px;margin-top:8px">请放宽延迟限制或选择更多地区</p></div>

<div class="card" id="rc" style="display:none">
<h3>测速结果 <span id="rt" style="font-size:11px;color:#8b949e;font-weight:400"></span></h3>
<div style="overflow-x:auto"><table><thead><tr><th>地区</th><th>IP</th><th>延迟</th><th>操作</th></tr></thead><tbody id="rb"></tbody></table></div>
<button class="btn btn-blue" onclick="copyAll()">复制全部 VLESS 链接</button>
</div>

<div class="toast" id="toast"></div>
<div class="ft">浏览器本地测速 · 结果取决于你的网络</div>

<script>
// ============ CONFIG ============
const WORKER_HOST = \'worker-mute-feather-ec8c.xufxyf.workers.dev\';
const DOMAIN = \'node.xuf.ccwu.cc\';
const UUID = \'b8f1ea10-178b-49eb-a48d-17b8c9680f4e\';

const COUNTRIES = [
  {code:\'JP\', name:\'日本\', flag:\'🇯🇵\', min:0, max:80, color:\'#3fb950\'},
  {code:\'SG\', name:\'新加坡\', flag:\'🇸🇬\', min:80, max:120, color:\'#58a6ff\'},
  {code:\'US-W\', name:\'美西\', flag:\'🇺🇸\', min:120, max:160, color:\'#d2991d\'},
  {code:\'US-C\', name:\'美中\', flag:\'🇺🇸\', min:160, max:200, color:\'#d2991d\'},
  {code:\'EU\', name:\'欧洲\', flag:\'🇪🇺\', min:200, max:250, color:\'#f0883e\'},
  {code:\'US-E\', name:\'美东\', flag:\'🇺🇸\', min:250, max:400, color:\'#f85149\'},
];

// CDN IP ranges - generate on the fly
const CDN_PREFIXES = [
  \'104.16.\', \'104.17.\', \'104.18.\', \'104.19.\', \'104.20.\', \'104.21.\',
  \'104.22.\', \'104.23.\', \'104.24.\', \'104.25.\', \'104.26.\', \'104.27.\',
  \'104.28.\', \'104.29.\', \'104.30.\', \'104.31.\',
  \'162.158.\', \'162.159.\',
  \'172.64.\', \'172.65.\', \'172.66.\', \'172.67.\', \'172.68.\', \'172.69.\',
  \'108.162.\',
  \'141.101.\',
  \'188.114.\',
  \'190.93.\',
];

function genIPs(n) {
  const ips = new Set();
  for (const pref of CDN_PREFIXES) {
    for (let j = 0; j < 5; j++) {
      ips.add(pref + Math.floor(Math.random()*256) + \'.\' + Math.floor(Math.random()*256));
    }
  }
  return [...ips].slice(0, n);
}

function countryCode(ms) {
  for (const c of COUNTRIES) {
    if (ms >= c.min && ms < c.max) return c.code;
  }
  return ms < 400 ? \'US-E\' : null;
}

function countryName(ms) {
  for (const c of COUNTRIES) {
    if (ms >= c.min && ms < c.max) return c.name;
  }
  return ms < 400 ? \'美东\' : null;
}

// ============ UI ============
var results = [];
var selectedCountries = new Set();

function initUI() {
  var html = \'\';
  COUNTRIES.forEach(function(c) {
    var checked = [\'JP\',\'SG\',\'US-W\'].includes(c.code) ? \' checked\' : \'\';
    html += \'<label class="\' + ([\'JP\',\'SG\',\'US-W\'].includes(c.code)?\'sel\':\'\') + \'" data-code="\'+c.code+\'" onclick="toggleCountry(this)"><span class="flag">\'+c.flag+\'</span><span>\'+c.name+\'</span></label>\';
  });
  document.getElementById(\'cbs\').innerHTML = html;
  COUNTRIES.forEach(function(c) {
    if ([\'JP\',\'SG\',\'US-W\'].includes(c.code)) selectedCountries.add(c.code);
  });
}

function toggleCountry(el) {
  var code = el.dataset.code;
  if (selectedCountries.has(code)) {
    selectedCountries.delete(code);
    el.classList.remove(\'sel\');
  } else {
    selectedCountries.add(code);
    el.classList.add(\'sel\');
  }
}

function toast(m) {
  var t = document.getElementById(\'toast\');
  t.textContent = m; t.classList.add(\'show\');
  setTimeout(function(){t.classList.remove(\'show\')}, 2000);
}

function latClass(ms) { return ms<80?\'g\':ms<180?\'y\':\'r\'; }

function makeLink(ip, lat) {
  return \'vless://\'+UUID+\'@\'+ip+\':443?encryption=none&security=tls&sni=\'+DOMAIN+\'&type=ws&host=\'+DOMAIN+\'&path=%2F%3Fed%3D2048#CF-\'+lat+\'ms\';
}

// ============ SPEED TEST ============
async function testOneIP(ip, controller) {
  var start = Date.now();
  try {
    // Connect to IP via HTTPS, measuring TCP+TLS+TTFB
    await fetch(\'https://\'+ip+\'/cdn-cgi/trace\', {
      mode: \'no-cors\',
      signal: controller.signal,
      cache: \'no-store\'
    });
  } catch(e) {
    // no-cors fetch "fails" but the connection was made - timing is valid
  }
  var elapsed = Date.now() - start;
  return { ip: ip, latency_ms: elapsed };
}

async function start() {
  if (selectedCountries.size === 0) { toast(\'请至少选择一个地区\'); return; }
  
  var btn = document.getElementById(\'go\');
  btn.disabled = true; btn.textContent = \'测速中...\';
  
  document.getElementById(\'empty\').classList.remove(\'show\');
  document.getElementById(\'rc\').style.display = \'none\';
  document.getElementById(\'prog\').classList.add(\'show\');
  document.getElementById(\'cnt\').style.display = \'block\';
  
  var maxLat = parseInt(document.getElementById(\'ms\').value) || 400;
  var limit = parseInt(document.getElementById(\'lm\').value);
  
  // Generate IPs
  var ips = genIPs(80);
  document.getElementById(\'pt\').textContent = \'已生成 \'+ips.length+\' 个 CDN IP，开始并发测试...\';
  
  results = [];
  var tested = 0;
  var total = ips.length;
  var controller = new AbortController();
  
  // Test in parallel batches of 15
  var batchSize = 15;
  for (var i = 0; i < ips.length; i += batchSize) {
    var batch = ips.slice(i, i + batchSize);
    var promises = batch.map(function(ip) {
      return testOneIP(ip, controller).then(function(r) {
        tested++;
        var pct = Math.round(tested / total * 100);
        document.getElementById(\'pf\').style.width = pct + \'%\';
        document.getElementById(\'pt\').textContent = \'测试中: \'+tested+\'/\'+total;
        document.getElementById(\'cnt\').textContent = tested + \' / \' + total;
        
        var code = countryCode(r.latency_ms);
        if (code && selectedCountries.has(code) && r.latency_ms < maxLat) {
          results.push(r);
          // Keep showing live results sorted
          results.sort(function(a,b){return a.latency_ms - b.latency_ms});
        }
        return r;
      });
    });
    
    await Promise.allSettled(promises);
    
    // Early stop if we have enough results
    if (results.length >= limit * 3 && tested > 40) break;
  }
  
  controller.abort(); // Abort any remaining
  
  // Final cleanup
  results = results.filter(function(r, i) {
    // Keep unique IPs, limit per country
    return true;
  }).slice(0, limit);
  
  document.getElementById(\'prog\').classList.remove(\'show\');
  document.getElementById(\'cnt\').style.display = \'none\';
  btn.disabled = false; btn.textContent = \'重新测速\';
  
  if (results.length === 0) {
    document.getElementById(\'empty\').classList.add(\'show\');
  } else {
    document.getElementById(\'rc\').style.display = \'block\';
    document.getElementById(\'rt\').textContent = new Date().toLocaleTimeString() + \' · \' + results.length + \'个节点\';
    renderTable();
  }
}

function renderTable() {
  var html = \'\';
  results.forEach(function(r, i) {
    var name = countryName(r.latency_ms) || \'其他\';
    html += \'<tr>\';
    html += \'<td>\'+name+\'</td>\';
    html += \'<td><code style="font-size:12px">\'+r.ip+\'</code></td>\';
    html += \'<td class="\'+latClass(r.latency_ms)+\'">\'+r.latency_ms+\'ms</td>\';
    html += \'<td><button class="cp" onclick="cpn(\'+i+\',this)">复制链接</button> \';
    html += \'<button class="cp" onclick="tvn(\'+i+\',this)" style="margin-left:2px">真连测试</button></td>\';
    html += \'</tr>\';
  });
  document.getElementById(\'rb\').innerHTML = html;
}

function cpn(i, btn) {
  var link = makeLink(results[i].ip, results[i].latency_ms);
  navigator.clipboard.writeText(link).then(function() {
    btn.textContent = \'已复制!\'; btn.classList.add(\'ok\');
    setTimeout(function(){btn.textContent=\'复制链接\';btn.classList.remove(\'ok\')},1500);
  });
  toast(\'VLESS 链接已复制\');
}

function tvn(i, btn) {
  var ip = results[i].ip;
  btn.textContent = \'测试中...\'; btn.classList.add(\'ok\');
  
  // Real HTTPS connection test through the Worker
  var start = Date.now();
  fetch(\'https://\'+ip+\'/cdn-cgi/trace\', {
    mode: \'no-cors\',
    cache: \'no-store\'
  }).catch(function(){}).finally(function() {
    var lat = Date.now() - start;
    btn.textContent = lat+\'ms\';
    if (lat < 100) btn.classList.add(\'ok\');
    else btn.classList.add(\'bad\');
    setTimeout(function(){btn.textContent=\'真连测试\';btn.classList.remove(\'ok\',\'bad\')},2000);
    results[i].latency_ms = lat;
    results[i].verified = true;
  });
}

function copyAll() {
  var links = results.map(function(r){return makeLink(r.ip, r.latency_ms)}).join(\'\\n\');
  navigator.clipboard.writeText(links).then(function(){toast(results.length+\' 个链接已复制\')});
}

// Init
initUI();
</script>
</body>
</html>
';
let userID = 'd342d11e-d424-4583-b36e-524ab1f0afa4';
let proxyIP = '';
function isValidUUID(uuid) {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
	}




if (!isValidUUID(userID)) {
	throw new Error('uuid is not valid');
}

export default {
	/**
	 * @param {import("@cloudflare/workers-types").Request} request
	 * @param {{UUID: string, PROXYIP: string}} env
	 * @param {import("@cloudflare/workers-types").ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env, ctx) {
		try {
			userID = env.UUID || userID;
			proxyIP = env.PROXYIP || proxyIP;
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				const url = new URL(request.url);
				switch (url.pathname) {
					case '/':
						return new Response(JSON.stringify(request.cf), { status: 200 });
					case `/${userID}`: {
						const vlessConfig = getVLESSConfig(userID, request.headers.get('Host'));
						return new Response(`${vlessConfig}`, {
							status: 200,
							headers: {
								"Content-Type": "text/plain;charset=utf-8",
							}
						});
					}
					default:
						return new Response('Not found', { status: 404 });
				}
			} else {
				return await vlessOverWSHandler(request);
			}
		} catch (err) {
			/** @type {Error} */ let e = err;
			return new Response(e.toString());
		}
	},
};




/**
 * 
 * @param {import("@cloudflare/workers-types").Request} request
 */
async function vlessOverWSHandler(request) {

	/** @type {import("@cloudflare/workers-types").WebSocket[]} */
	// @ts-ignore
	const webSocketPair = new WebSocketPair();
	const [client, webSocket] = Object.values(webSocketPair);

	webSocket.accept();

	let address = '';
	let portWithRandomLog = '';
	const log = (/** @type {string} */ info, /** @type {string | undefined} */ event) => {
		console.log(`[${address}:${portWithRandomLog}] ${info}`, event || '');
	};
	const earlyDataHeader = request.headers.get('sec-websocket-protocol') || '';

	const readableWebSocketStream = makeReadableWebSocketStream(webSocket, earlyDataHeader, log);

	/** @type {{ value: import("@cloudflare/workers-types").Socket | null}}*/
	let remoteSocketWapper = {
		value: null,
	};
	let udpStreamWrite = null;
	let isDns = false;

	// ws --> remote
	readableWebSocketStream.pipeTo(new WritableStream({
		async write(chunk, controller) {
			if (isDns && udpStreamWrite) {
				return udpStreamWrite(chunk);
			}
			if (remoteSocketWapper.value) {
				const writer = remoteSocketWapper.value.writable.getWriter()
				await writer.write(chunk);
				writer.releaseLock();
				return;
			}

			const {
				hasError,
				message,
				portRemote = 443,
				addressRemote = '',
				rawDataIndex,
				vlessVersion = new Uint8Array([0, 0]),
				isUDP,
			} = processVlessHeader(chunk, userID);
			address = addressRemote;
			portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? 'udp ' : 'tcp '
				} `;
			if (hasError) {
				// controller.error(message);
				throw new Error(message); // cf seems has bug, controller.error will not end stream
				// webSocket.close(1000, message);
				return;
			}
			// if UDP but port not DNS port, close it
			if (isUDP) {
				if (portRemote === 53) {
					isDns = true;
				} else {
					// controller.error('UDP proxy only enable for DNS which is port 53');
					throw new Error('UDP proxy only enable for DNS which is port 53'); // cf seems has bug, controller.error will not end stream
					return;
				}
			}
			// ["version", "附加信息长度 N"]
			const vlessResponseHeader = new Uint8Array([vlessVersion[0], 0]);
			const rawClientData = chunk.slice(rawDataIndex);

			// TODO: support udp here when cf runtime has udp support
			if (isDns) {
				const { write } = await handleUDPOutBound(webSocket, vlessResponseHeader, log);
				udpStreamWrite = write;
				udpStreamWrite(rawClientData);
				return;
			}
			handleTCPOutBound(remoteSocketWapper, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log);
		},
		close() {
			log(`readableWebSocketStream is close`);
		},
		abort(reason) {
			log(`readableWebSocketStream is abort`, JSON.stringify(reason));
		},
	})).catch((err) => {
		log('readableWebSocketStream pipeTo error', err);
	});

	return new Response(null, {
		status: 101,
		// @ts-ignore
		webSocket: client,
	});
}

/**
 * Handles outbound TCP connections.
 *
 * @param {any} remoteSocket 
 * @param {string} addressRemote The remote address to connect to.
 * @param {number} portRemote The remote port to connect to.
 * @param {Uint8Array} rawClientData The raw client data to write.
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket The WebSocket to pass the remote socket to.
 * @param {Uint8Array} vlessResponseHeader The VLESS response header.
 * @param {function} log The logging function.
 * @returns {Promise<void>} The remote socket.
 */
async function handleTCPOutBound(remoteSocket, addressRemote, portRemote, rawClientData, webSocket, vlessResponseHeader, log,) {
	async function connectAndWrite(address, port) {
		/** @type {import("@cloudflare/workers-types").Socket} */
		const tcpSocket = connect({
			hostname: address,
			port: port,
		});
		remoteSocket.value = tcpSocket;
		log(`connected to ${address}:${port}`);
		const writer = tcpSocket.writable.getWriter();
		await writer.write(rawClientData); // first write, nomal is tls client hello
		writer.releaseLock();
		return tcpSocket;
	}

	// if the cf connect tcp socket have no incoming data, we retry to redirect ip
	async function retry() {
		const tcpSocket = await connectAndWrite(proxyIP || addressRemote, portRemote)
		// no matter retry success or not, close websocket
		tcpSocket.closed.catch(error => {
			console.log('retry tcpSocket closed error', error);
		}).finally(() => {
			safeCloseWebSocket(webSocket);
		})
		remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, null, log);
	}

	const tcpSocket = await connectAndWrite(addressRemote, portRemote);

	// when remoteSocket is ready, pass to websocket
	// remote--> ws
	remoteSocketToWS(tcpSocket, webSocket, vlessResponseHeader, retry, log);
}

/**
 * 
 * @param {import("@cloudflare/workers-types").WebSocket} webSocketServer
 * @param {string} earlyDataHeader for ws 0rtt
 * @param {(info: string)=> void} log for ws 0rtt
 */
function makeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
	let readableStreamCancel = false;
	const stream = new ReadableStream({
		start(controller) {
			webSocketServer.addEventListener('message', (event) => {
				if (readableStreamCancel) {
					return;
				}
				const message = event.data;
				controller.enqueue(message);
			});

			// The event means that the client closed the client -> server stream.
			// However, the server -> client stream is still open until you call close() on the server side.
			// The WebSocket protocol says that a separate close message must be sent in each direction to fully close the socket.
			webSocketServer.addEventListener('close', () => {
				// client send close, need close server
				// if stream is cancel, skip controller.close
				safeCloseWebSocket(webSocketServer);
				if (readableStreamCancel) {
					return;
				}
				controller.close();
			}
			);
			webSocketServer.addEventListener('error', (err) => {
				log('webSocketServer has error');
				controller.error(err);
			}
			);
			// for ws 0rtt
			const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
			if (error) {
				controller.error(error);
			} else if (earlyData) {
				controller.enqueue(earlyData);
			}
		},

		pull(controller) {
			// if ws can stop read if stream is full, we can implement backpressure
			// https://streams.spec.whatwg.org/#example-rs-push-backpressure
		},
		cancel(reason) {
			// 1. pipe WritableStream has error, this cancel will called, so ws handle server close into here
			// 2. if readableStream is cancel, all controller.close/enqueue need skip,
			// 3. but from testing controller.error still work even if readableStream is cancel
			if (readableStreamCancel) {
				return;
			}
			log(`ReadableStream was canceled, due to ${reason}`)
			readableStreamCancel = true;
			safeCloseWebSocket(webSocketServer);
		}
	});

	return stream;

}

// https://xtls.github.io/development/protocols/vless.html
// https://github.com/zizifn/excalidraw-backup/blob/main/v2ray-protocol.excalidraw

/**
 * 
 * @param { ArrayBuffer} vlessBuffer 
 * @param {string} userID 
 * @returns 
 */
function processVlessHeader(
	vlessBuffer,
	userID
) {
	if (vlessBuffer.byteLength < 24) {
		return {
			hasError: true,
			message: 'invalid data',
		};
	}
	const version = new Uint8Array(vlessBuffer.slice(0, 1));
	let isValidUser = false;
	let isUDP = false;
	if (stringify(new Uint8Array(vlessBuffer.slice(1, 17))) === userID) {
		isValidUser = true;
	}
	if (!isValidUser) {
		return {
			hasError: true,
			message: 'invalid user',
		};
	}

	const optLength = new Uint8Array(vlessBuffer.slice(17, 18))[0];
	//skip opt for now

	const command = new Uint8Array(
		vlessBuffer.slice(18 + optLength, 18 + optLength + 1)
	)[0];

	// 0x01 TCP
	// 0x02 UDP
	// 0x03 MUX
	if (command === 1) {
	} else if (command === 2) {
		isUDP = true;
	} else {
		return {
			hasError: true,
			message: `command ${command} is not support, command 01-tcp,02-udp,03-mux`,
		};
	}
	const portIndex = 18 + optLength + 1;
	const portBuffer = vlessBuffer.slice(portIndex, portIndex + 2);
	// port is big-Endian in raw data etc 80 == 0x005d
	const portRemote = new DataView(portBuffer).getUint16(0);

	let addressIndex = portIndex + 2;
	const addressBuffer = new Uint8Array(
		vlessBuffer.slice(addressIndex, addressIndex + 1)
	);

	// 1--> ipv4  addressLength =4
	// 2--> domain name addressLength=addressBuffer[1]
	// 3--> ipv6  addressLength =16
	const addressType = addressBuffer[0];
	let addressLength = 0;
	let addressValueIndex = addressIndex + 1;
	let addressValue = '';
	switch (addressType) {
		case 1:
			addressLength = 4;
			addressValue = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			).join('.');
			break;
		case 2:
			addressLength = new Uint8Array(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + 1)
			)[0];
			addressValueIndex += 1;
			addressValue = new TextDecoder().decode(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			break;
		case 3:
			addressLength = 16;
			const dataView = new DataView(
				vlessBuffer.slice(addressValueIndex, addressValueIndex + addressLength)
			);
			// 2001:0db8:85a3:0000:0000:8a2e:0370:7334
			const ipv6 = [];
			for (let i = 0; i < 8; i++) {
				ipv6.push(dataView.getUint16(i * 2).toString(16));
			}
			addressValue = ipv6.join(':');
			// seems no need add [] for ipv6
			break;
		default:
			return {
				hasError: true,
				message: `invild  addressType is ${addressType}`,
			};
	}
	if (!addressValue) {
		return {
			hasError: true,
			message: `addressValue is empty, addressType is ${addressType}`,
		};
	}

	return {
		hasError: false,
		addressRemote: addressValue,
		addressType,
		portRemote,
		rawDataIndex: addressValueIndex + addressLength,
		vlessVersion: version,
		isUDP,
	};
}


/**
 * 
 * @param {import("@cloudflare/workers-types").Socket} remoteSocket 
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket 
 * @param {ArrayBuffer} vlessResponseHeader 
 * @param {(() => Promise<void>) | null} retry
 * @param {*} log 
 */
async function remoteSocketToWS(remoteSocket, webSocket, vlessResponseHeader, retry, log) {
	// remote--> ws
	let remoteChunkCount = 0;
	let chunks = [];
	/** @type {ArrayBuffer | null} */
	let vlessHeader = vlessResponseHeader;
	let hasIncomingData = false; // check if remoteSocket has incoming data
	await remoteSocket.readable
		.pipeTo(
			new WritableStream({
				start() {
				},
				/**
				 * 
				 * @param {Uint8Array} chunk 
				 * @param {*} controller 
				 */
				async write(chunk, controller) {
					hasIncomingData = true;
					// remoteChunkCount++;
					if (webSocket.readyState !== WS_READY_STATE_OPEN) {
						controller.error(
							'webSocket.readyState is not open, maybe close'
						);
					}
					if (vlessHeader) {
						webSocket.send(await new Blob([vlessHeader, chunk]).arrayBuffer());
						vlessHeader = null;
					} else {
						// seems no need rate limit this, CF seems fix this??..
						// if (remoteChunkCount > 20000) {
						// 	// cf one package is 4096 byte(4kb),  4096 * 20000 = 80M
						// 	await delay(1);
						// }
						webSocket.send(chunk);
					}
				},
				close() {
					log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
					// safeCloseWebSocket(webSocket); // no need server close websocket frist for some case will casue HTTP ERR_CONTENT_LENGTH_MISMATCH issue, client will send close event anyway.
				},
				abort(reason) {
					console.error(`remoteConnection!.readable abort`, reason);
				},
			})
		)
		.catch((error) => {
			console.error(
				`remoteSocketToWS has exception `,
				error.stack || error
			);
			safeCloseWebSocket(webSocket);
		});

	// seems is cf connect socket have error,
	// 1. Socket.closed will have error
	// 2. Socket.readable will be close without any data coming
	if (hasIncomingData === false && retry) {
		log(`retry`)
		retry();
	}
}

/**
 * 
 * @param {string} base64Str 
 * @returns 
 */
function base64ToArrayBuffer(base64Str) {
	if (!base64Str) {
		return { error: null };
	}
	try {
		// go use modified Base64 for URL rfc4648 which js atob not support
		base64Str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
		const decode = atob(base64Str);
		const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
		return { earlyData: arryBuffer.buffer, error: null };
	} catch (error) {
		return { error };
	}
}

/**
 * This is not real UUID validation
 * @param {string} uuid 
 */
function isValidUUID(uuid) {
	try {
		if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
			socket.close();
		}
	} catch (error) {
		console.error('safeCloseWebSocket error', error);
	}
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
	byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
	return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
	const uuid = unsafeStringify(arr, offset);
	if (!isValidUUID(uuid)) {
		throw TypeError("Stringified UUID is invalid");
	}
	return uuid;
}


/**
 * 
 * @param {import("@cloudflare/workers-types").WebSocket} webSocket 
 * @param {ArrayBuffer} vlessResponseHeader 
 * @param {(string)=> void} log 
 */
async function handleUDPOutBound(webSocket, vlessResponseHeader, log) {

	let isVlessHeaderSent = false;
	const transformStream = new TransformStream({
		start(controller) {

		},
		transform(chunk, controller) {
			// udp message 2 byte is the the length of udp data
			// TODO: this should have bug, beacsue maybe udp chunk can be in two websocket message
			for (let index = 0; index < chunk.byteLength;) {
				const lengthBuffer = chunk.slice(index, index + 2);
				const udpPakcetLength = new DataView(lengthBuffer).getUint16(0);
				const udpData = new Uint8Array(
					chunk.slice(index + 2, index + 2 + udpPakcetLength)
				);
				index = index + 2 + udpPakcetLength;
				controller.enqueue(udpData);
			}
		},
		flush(controller) {
		}
	});

	// only handle dns udp for now
	transformStream.readable.pipeTo(new WritableStream({
		async write(chunk) {
			const resp = await fetch('https://1.1.1.1/dns-query',
				{
					method: 'POST',
					headers: {
						'content-type': 'application/dns-message',
					},
					body: chunk,
				})
			const dnsQueryResult = await resp.arrayBuffer();
			const udpSize = dnsQueryResult.byteLength;
			// console.log([...new Uint8Array(dnsQueryResult)].map((x) => x.toString(16)));
			const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);
			if (webSocket.readyState === WS_READY_STATE_OPEN) {
				log(`doh success and dns message length is ${udpSize}`);
				if (isVlessHeaderSent) {
					webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
				} else {
					webSocket.send(await new Blob([vlessResponseHeader, udpSizeBuffer, dnsQueryResult]).arrayBuffer());
					isVlessHeaderSent = true;
				}
			}
		}
	})).catch((error) => {
		log('dns udp has error' + error)
	});

	const writer = transformStream.writable.getWriter();

	return {
		/**
		 * 
		 * @param {Uint8Array} chunk 
		 */
		write(chunk) {
			writer.write(chunk);
		}
	};
}

/**
 * 
 * @param {string} userID 
 * @param {string | null} hostName
 * @returns {string}
 */
function getVLESSConfig(userID, hostName) {
	const protocol = "vless";
	const vlessMain = 
	`${protocol}` + 
	`://${userID}@${hostName}:443`+
	`?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${hostName}`;
	
	return `
################################################################
v2ray
---------------------------------------------------------------
${vlessMain}
---------------------------------------------------------------
################################################################
clash-meta
---------------------------------------------------------------
- type: vless
  name: ${hostName}
  server: ${hostName}
  port: 443
  uuid: ${userID}
  network: ws
  tls: true
  udp: false
  sni: ${hostName}
  client-fingerprint: chrome
  ws-opts:
    path: "/?ed=2048"
    headers:
      host: ${hostName}
---------------------------------------------------------------
################################################################
`;
}


