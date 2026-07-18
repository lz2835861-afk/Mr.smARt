/**
 * Vercel Serverless — Agent Chat 端点 (/api/agent/chat)
 */

import { getAgentReply } from '../../server/services/hunyuan.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [], mode = 'csig' } = req.body;

  if (!messages.length) {
    return res.status(400).json({ error: '缺少 messages 参数' });
  }

  try {
    const result = await getAgentReply(messages, mode);
    return res.json(result);
  } catch (error) {
    console.error('[Agent Chat] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
