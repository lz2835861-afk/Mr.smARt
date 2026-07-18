export default function handler(req, res) {
  res.json({ ok: true, path: req.url, method: req.method });
}
