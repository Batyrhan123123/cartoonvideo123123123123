import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';


function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function amoCrmDevPlugin(env: Record<string, string>): Plugin {
  const getToken = () => {
    if (env.AMO_ACCESS_TOKEN_PART1 && env.AMO_ACCESS_TOKEN_PART2)
      return env.AMO_ACCESS_TOKEN_PART1 + env.AMO_ACCESS_TOKEN_PART2;
    return env.AMO_ACCESS_TOKEN || '';
  };

  return {
    name: 'amocrm-local-dev',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // CORS preflight
        if (req.method === 'OPTIONS' && req.url?.startsWith('/api/')) {
          json(res, 204, null);
          return;
        }

        // GET /api/config — return safe local config
        if (req.url === '/api/config' && req.method === 'GET') {
          json(res, 200, { API_BASE_URL: '' });
          return;
        }

        // POST /api/v1/amocrm/create-lead — handle locally
        if (req.url === '/api/v1/amocrm/create-lead' && req.method === 'POST') {
          try {
            const raw = await readBody(req);
            const { name, phone, topic = '' } = JSON.parse(raw);

            if (!name?.trim() || !phone?.trim()) {
              json(res, 200, { success: false, message: 'Имя и телефон обязательны.' });
              return;
            }

            const subdomain = env.AMO_SUBDOMAIN;
            const token = getToken();

            if (!subdomain || !token) {
              console.error(
                '[amoCRM] Missing env: AMO_SUBDOMAIN=%s, token=%s chars',
                subdomain || 'MISSING',
                token ? token.length : 0,
              );
              json(res, 200, {
                success: false,
                message: 'AMO_SUBDOMAIN или AMO_ACCESS_TOKEN не найдены в .env файле проекта.',
              });
              return;
            }

            const baseUrl = `https://${subdomain}.amocrm.ru`;
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

            // --- Step 1: Create contact ---
            const contactPayload: Record<string, unknown>[] = [{
              name: name.trim(),
              custom_fields_values: [{ field_code: 'PHONE', values: [{ value: phone.trim(), enum_code: 'MOB' }] }],
            }];
            if (env.AMO_RESPONSIBLE_USER_ID)
              contactPayload[0].responsible_user_id = parseInt(env.AMO_RESPONSIBLE_USER_ID);

            console.log(`[amoCRM] Creating contact for "${name.trim()}"...`);
            const cResp = await fetch(`${baseUrl}/api/v4/contacts`, {
              method: 'POST', headers, body: JSON.stringify(contactPayload),
            });

            if (!cResp.ok) {
              const errText = await cResp.text();
              console.error(`[amoCRM] Contact failed (${cResp.status}):`, errText);
              throw new Error(`amoCRM contact ${cResp.status}`);
            }

            const cData: any = await cResp.json();
            const contactId: number = cData._embedded.contacts[0].id;
            console.log(`[amoCRM] Contact created: ${contactId}`);

            // --- Step 2: Create lead ---
            const leadName = topic.trim()
              ? `Заявка: ${topic.trim()} — ${name.trim()}`
              : `Заявка с сайта CARTOON — ${name.trim()}`;

            const leadBody: Record<string, unknown> = {
              name: leadName,
              _embedded: { contacts: [{ id: contactId }] },
            };
            if (env.AMO_PIPELINE_ID) leadBody.pipeline_id = parseInt(env.AMO_PIPELINE_ID);
            if (env.AMO_STATUS_ID) leadBody.status_id = parseInt(env.AMO_STATUS_ID);
            if (env.AMO_RESPONSIBLE_USER_ID) leadBody.responsible_user_id = parseInt(env.AMO_RESPONSIBLE_USER_ID);

            console.log(`[amoCRM] Creating lead: "${leadName}"...`);
            const lResp = await fetch(`${baseUrl}/api/v4/leads`, {
              method: 'POST', headers, body: JSON.stringify([leadBody]),
            });

            if (!lResp.ok) {
              const errText = await lResp.text();
              console.error(`[amoCRM] Lead failed (${lResp.status}):`, errText);
              throw new Error(`amoCRM lead ${lResp.status}`);
            }

            const lData: any = await lResp.json();
            const leadId: number = lData._embedded.leads[0].id;
            console.log(`[amoCRM] Lead created: ${leadId}`);

            // --- Step 3 (optional): Attach note ---
            if (topic.trim()) {
              try {
                await fetch(`${baseUrl}/api/v4/leads/${leadId}/notes`, {
                  method: 'POST', headers,
                  body: JSON.stringify([{
                    note_type: 'common',
                    params: { text: `Тематика: ${topic.trim()}\nИмя: ${name.trim()}\nТелефон: ${phone.trim()}` },
                  }]),
                });
              } catch { /* non-critical */ }
            }

            json(res, 200, { success: true, message: 'Заявка успешно отправлена!', lead_id: leadId, contact_id: contactId });
          } catch (err) {
            console.error('[amoCRM] Error:', err);
            json(res, 200, { success: false, message: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите в WhatsApp.' });
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  return {
    plugins: [
      react(),
      amoCrmDevPlugin(env),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.VITE_PORT || '3000'),
      watch: { usePolling: true, interval: 600 },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip',
            ],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'utils-vendor': [
              'axios',
              'clsx',
              'tailwind-merge',
              'class-variance-authority',
              'date-fns',
              'lucide-react',
            ],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
