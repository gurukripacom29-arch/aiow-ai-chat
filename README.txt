AIOW AI CHAT - DEPLOYMENT NOTES

Files:
- index.html: AIOW site with AI chat interface
- netlify/functions/ai-chat.mjs: secure Netlify Function calling Gemini
- netlify.toml: Netlify build configuration

IMPORTANT:
1. Do not put your Gemini API key in index.html or share it in chat.
2. In Netlify Project configuration / Environment variables, add:
   Key: GEMINI_API_KEY
   Value: (your Gemini API key)
3. Deploy this project using Netlify CLI or connect the project repository to Netlify.
   A static Netlify Drop upload alone does not configure/deploy serverless functions.
4. After deploy, open https://aiow.netlify.app and test the AI chat.

Gemini free tier has model/region/rate limits and can change. Review Google's current terms and pricing.
