# PennyCore Discord — Initial integration

- Discord application: `1531868631325999256`
- Signed HTTP interactions endpoint: `https://www.wildcarddev.com/api/discord`
- Command: `/penny question:<text>`
- Reuses the **public** WildCard Party Ask Penny provider only. No PennyCore
  private memory, cross-user history, moderation, owner actions, or background
  channel monitoring are included in this version.

## Deployment checklist

1. Configure Vercel `DISCORD_PUBLIC_KEY` (Discord Bot public key) and
   `DISCORD_ALLOWED_GUILD_ID` (WildCard DEV server ID). Do not paste credentials
   into chat. These two values are identifiers, not secrets.
2. Deploy and verify that GET `/api/discord` is 405, invalid signed POST is
   401, and Discord Developer Portal accepts a signed PING.
3. In Discord Developer Portal, set **Interactions Endpoint URL** to the
   production URL above.
4. Set `DISCORD_BOT_TOKEN` locally as a secret for the one-time
   `node scripts/register-discord-penny.mjs` command. The token is never
   needed for the deployed interaction handler.
5. Test `/penny question:Hello!` in the allowed server.

The endpoint acknowledges within Discord's 3-second window, uses Vercel
`waitUntil()` to send the slower AI answer through Discord's interaction
webhook, validates Ed25519 signatures, and disables all automatic mentions.
