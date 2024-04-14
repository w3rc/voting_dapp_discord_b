### Voting DApp Bot Documentation

This documentation provides a comprehensive guide on setting up and utilizing the Voting DApp Bot, a Discord bot built using the `discord.js` library. The bot is designed to interact with election data, providing commands to view ongoing and past elections, election details, and candidate information.

#### Setup

**Dependencies**:
- `discord.js`: A powerful library to interact with the Discord API.
- `@discordjs/rest`: For handling REST requests.
- `discord-api-types/v9`: Provides TypeScript types for Discord API routes.
- `axios`: Used for making HTTP requests.
- `dotenv`: Manages environment variables.

**Environment Configuration**:
Ensure `.env` file is set up with the necessary tokens and IDs:
- `BOT_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `ELECTION_CREATED_TOPIC_ID`
- `ELECTION_ENDED_TOPIC_ID`
- `CANDIDATE_ADDED_TOPIC_ID`

#### Command Configuration
Commands include:
- `/hello`: Replies with a greeting.
- `/view-ongoing-elections`: Lists ongoing elections.
- `/view-past-elections`: Lists elections that have ended.
- `/view-election-details`: Provides detailed information about a specific election, requiring an `election_id`.
- `/view-candidates`: Lists candidates for a specific election, requiring an `election_id`.
- `/help`: Lists all available command