export default function handler(req, res) {
    const { filename } = req.query;
    if (!filename) {
        return res.status(400).json({ error: "Filename is required" });
    }

    // Generate the Wasabi file URL
    const wasabiUrl = `https://s3.us-east-1.wasabisys.com/telebot1/${filename}`;

    // Redirect to the Wasabi file URL for direct download
    res.redirect(wasabiUrl);
}
