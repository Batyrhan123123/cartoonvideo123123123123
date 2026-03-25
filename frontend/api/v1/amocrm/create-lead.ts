import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { name, phone, topic = '' } = req.body ?? {};

    if (!name?.trim() || !phone?.trim()) {
      return res.json({ success: false, message: 'Имя и телефон обязательны.' });
    }

    const subdomain = process.env.AMO_SUBDOMAIN;
    const token =
      process.env.AMO_ACCESS_TOKEN_PART1 && process.env.AMO_ACCESS_TOKEN_PART2
        ? process.env.AMO_ACCESS_TOKEN_PART1 + process.env.AMO_ACCESS_TOKEN_PART2
        : process.env.AMO_ACCESS_TOKEN;

    if (!subdomain || !token) {
      console.error('[amoCRM] Missing env: AMO_SUBDOMAIN or AMO_ACCESS_TOKEN');
      return res.json({ success: false, message: 'CRM временно недоступна. Напишите в WhatsApp.' });
    }

    const baseUrl = `https://${subdomain}.amocrm.ru`;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Step 1: Create contact
    const contactPayload: Record<string, unknown>[] = [{
      name: name.trim(),
      custom_fields_values: [{ field_code: 'PHONE', values: [{ value: phone.trim(), enum_code: 'MOB' }] }],
    }];
    if (process.env.AMO_RESPONSIBLE_USER_ID)
      contactPayload[0].responsible_user_id = parseInt(process.env.AMO_RESPONSIBLE_USER_ID);

    const cResp = await fetch(`${baseUrl}/api/v4/contacts`, {
      method: 'POST', headers, body: JSON.stringify(contactPayload),
    });
    if (!cResp.ok) throw new Error(`Contact: ${cResp.status}`);
    const cData: any = await cResp.json();
    const contactId: number = cData._embedded.contacts[0].id;

    // Step 2: Create lead
    const leadName = topic.trim()
      ? `Заявка: ${topic.trim()} — ${name.trim()}`
      : `Заявка с сайта CARTOON — ${name.trim()}`;

    const leadBody: Record<string, unknown> = {
      name: leadName,
      _embedded: { contacts: [{ id: contactId }] },
    };
    if (process.env.AMO_PIPELINE_ID) leadBody.pipeline_id = parseInt(process.env.AMO_PIPELINE_ID);
    if (process.env.AMO_STATUS_ID) leadBody.status_id = parseInt(process.env.AMO_STATUS_ID);
    if (process.env.AMO_RESPONSIBLE_USER_ID) leadBody.responsible_user_id = parseInt(process.env.AMO_RESPONSIBLE_USER_ID);

    const lResp = await fetch(`${baseUrl}/api/v4/leads`, {
      method: 'POST', headers, body: JSON.stringify([leadBody]),
    });
    if (!lResp.ok) throw new Error(`Lead: ${lResp.status}`);
    const lData: any = await lResp.json();
    const leadId: number = lData._embedded.leads[0].id;

    // Step 3 (optional): Note
    if (topic.trim()) {
      try {
        await fetch(`${baseUrl}/api/v4/leads/${leadId}/notes`, {
          method: 'POST', headers,
          body: JSON.stringify([{ note_type: 'common', params: { text: `Тематика: ${topic.trim()}\nИмя: ${name.trim()}\nТелефон: ${phone.trim()}` } }]),
        });
      } catch { /* non-critical */ }
    }

    return res.json({ success: true, message: 'Заявка успешно отправлена!', lead_id: leadId, contact_id: contactId });
  } catch (err) {
    console.error('[amoCRM] Error:', err);
    return res.json({ success: false, message: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите в WhatsApp.' });
  }
}
