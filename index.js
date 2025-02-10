const { Telegraf } = require("telegraf");
const AWS = require("aws-sdk");
const axios = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WASABI_ACCESS_KEY = process.env.WASABI_ACCESS_KEY;
const WASABI_SECRET_KEY = process.env.WASABI_SECRET_KEY;
const WASABI_BUCKET_NAME = process.env.WASABI_BUCKET_NAME;
const WASABI_REGION = process.env.WASABI_REGION;
const WASABI_ENDPOINT = `https://s3.${WASABI_REGION}.wasabisys.com`;
const VERCEL_DOMAIN = "https://telefilebot.vercel.app"; // Change to your actual Vercel domain

// Initialize Telegram bot
const bot = new Telegraf(BOT_TOKEN);

// Configure AWS SDK for Wasabi
const s3 = new AWS.S3({
    endpoint: WASABI_ENDPOINT,
    accessKeyId: WASABI_ACCESS_KEY,
    secretAccessKey: WASABI_SECRET_KEY,
    region: WASABI_REGION,
    signatureVersion: "v4",
});

// Upload file to Wasabi
async function uploadToWasabi(fileStream, fileName) {
    try {
        const uploadParams = {
            Bucket: WASABI_BUCKET_NAME,
            Key: fileName,
            Body: fileStream,
            ContentType: "application/octet-stream",
        };

        await s3.upload(uploadParams).promise();

        return fileName; // Just return filename instead of full Wasabi URL
    } catch (error) {
        console.error("Wasabi Upload Error:", error);
        throw new Error("Failed to upload to Wasabi.");
    }
}

// Handle file uploads from Telegram
bot.on("message", async (ctx) => {
    try {
        const fileObj = ctx.message.document || ctx.message.video || ctx.message.audio;
        if (!fileObj) return;

        const fileId = fileObj.file_id;
        const fileName = fileObj.file_name || `file_${Date.now()}`;
        const fileUrl = await ctx.telegram.getFileLink(fileId);

        // Download file from Telegram
        const response = await axios({
            url: fileUrl.href,
            method: "GET",
            responseType: "stream",
        });

        // Upload file to Wasabi
        const storedFileName = await uploadToWasabi(response.data, fileName);

        // Generate Vercel-based URLs
        const downloadUrl = `${VERCEL_DOMAIN}/file/${storedFileName}`;
        const streamUrl = `${VERCEL_DOMAIN}/stream/${storedFileName}`;

        await ctx.reply(
            `✅ Your file is now available:\n\n📥 **Download**: [Click Here](${downloadUrl})\n▶️ **Stream**: [Watch Online](${streamUrl})`,
            { parse_mode: "Markdown" }
        );
    } catch (error) {
        console.error("Error:", error);
        await ctx.reply("⚠️ Error processing your file.");
    }
});

// Start the bot
bot.launch();
