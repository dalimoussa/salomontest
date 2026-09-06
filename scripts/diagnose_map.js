const { spawn } = require('child_process');

async function main() {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9222',
    '--window-size=1920,1080',
    'http://127.0.0.1:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    const pageTab = tabs.find(t => t.type === 'page');
    console.log('Page tab URL:', pageTab ? pageTab.url : 'none');

    if (!pageTab || !pageTab.webSocketDebuggerUrl) {
      console.log('No debugger URL found');
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const id = msgId++;
        const handler = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === id) {
            ws.removeEventListener('message', handler);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const args = data.params.args.map(a => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
        console.log(`[BROWSER CONSOLE ${data.params.type}]`, args);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error(`[BROWSER EXCEPTION]`, data.params.exceptionDetails);
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Waiting 5 seconds for page & map to settle...');
    await new Promise(r => setTimeout(r, 5000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.querySelector('.maplibregl-canvas');
        const container = document.querySelector('[role=\"main\"]');
        const mapDiv = document.querySelector('[aria-label=\"高尾山3Dマップ\"]');
        return {
          hasCanvas: !!canvas,
          canvasWidth: canvas ? canvas.width : 0,
          canvasHeight: canvas ? canvas.height : 0,
          canvasClientW: canvas ? canvas.clientWidth : 0,
          canvasClientH: canvas ? canvas.clientHeight : 0,
          hasContainer: !!container,
          containerClientW: container ? container.clientWidth : 0,
          containerClientH: container ? container.clientHeight : 0,
          hasMapDiv: !!mapDiv,
          mapDivClientW: mapDiv ? mapDiv.clientWidth : 0,
          mapDivClientH: mapDiv ? mapDiv.clientHeight : 0,
          bodyChildren: document.body.children.length,
          title: document.title,
        };
      })()`,
      returnByValue: true
    });

    console.log('DOM Evaluation Result:', evalRes?.result?.value);

  } catch (err) {
    console.error('Diagnostic error:', err);
  } finally {
    proc.kill();
  }
}

main().catch(console.error);
