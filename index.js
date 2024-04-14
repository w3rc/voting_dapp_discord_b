const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const axios = require('axios');
require('dotenv').config();

const commands = [
  {
    name: 'hello',
    description: 'Replies with Hello!'
  }, {
    name: 'view-ongoing-elections',
    description: 'View ongoing elections'
  }, {
    name: 'view-past-elections',
    description: 'View past elections'
  },
  {
    name: 'view-election-details',
    description: 'View details of an election',
    options: [
      {
        name: 'election_id',
        type: 3,
        description: 'The ID of the election',
        required: true,
      },
    ],
  },
  {
    name: 'view-candidates',
    description: 'View candidates for an election',
    options: [
      {
        name: 'election_id',
        type: 3,
        description: 'The ID of the election',
        required: true,
      },
    ],
  },
  {
    name: 'cast-vote',
    description: 'Cast a vote for a candidate',
    options: [
      {
        name: 'email_address',
        type: 3,
        description: 'Your email address',
        required: true,
      },
      {
        name: 'election_id',
        type: 3,
        description: 'The ID of the election',
        required: true,
      },
      {
        name: 'candidate_id',
        type: 3,
        description: 'The ID of the candidate',
        required: true,
      },
    ],
  },
  {
    name: 'register-candidate',
    description: 'Register as a candidate',
    options: [
      {
        name: 'email_address',
        type: 3,
        description: 'Your email address',
        required: true,
      },
      {
        name: 'election_id',
        type: 3,
        description: 'The ID of the election',
        required: true,
      },
      {
        name: 'candidate_name',
        type: 3,
        description: 'Your name',
        required: true,
      },
    ],
  },
  {
    name: 'help',
    description: 'Help command'
  }
];

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'hello') {
    await interaction.reply('Welcome to Voting DApp Bot!');
  } else if (commandName === 'view-ongoing-elections') {
    const ongoingElections = await getOngoingElections()
    if (ongoingElections.length > 0) {
      const electionList = ongoingElections.map((election) => {
        return `**ID:** ${election.electionId}, **Name:**  ${election.electionName ?? "Untitled"}`
      });
      await interaction.reply(electionList.join('\n'));
    } else {
      await interaction.reply('No ongoing elections');
    }
  } else if (commandName === 'view-past-elections') {
    const pastElections = await getEndedElections()
    if (pastElections.length > 0) {
      const electionList = pastElections.map((election) => {
        return `ID: ${election.electionId}, Name:  ${election.electionName ?? "Untitled"}`
      });
      await interaction.reply(electionList.join('\n'));
    } else {
      await interaction.reply('No past elections');
    }
  } else if (commandName === 'view-election-details') {
    const electionId = interaction.options.getString('election_id');
    const elections = await getElections();
    const election = elections.find((election) => election.electionId === electionId);
    const endedElectionIds = (await getEndedElections()).map((election) => election.electionId);
    const isEnded = endedElectionIds.includes(electionId);
    const electionCandidates = await getCandidates(electionId);
    const electionCandidatesNames = electionCandidates.map((candidate) => candidate.candidateName.replaceAll('\'', ''));

    if (election) {
      await interaction.reply(`\n\n
        ***Election Details***
        **Election ID:** ${election.electionId}
        **Election Name:** ${election.electionName}
        **Candidates:** ${(electionCandidatesNames.length > 0) ? electionCandidatesNames.join(", ") : "No candidates"}
        **Timestamp:** ${isEnded ? "Winner announced at " : "Started at "}  ${election.timestamp}
        **Ended:** ${isEnded}
        **Winner:** ${isEnded ? election.winnerName : "Election is ongoing"}`
      );
    } else {
      await interaction.reply(`Election with ID ${electionId} not found`);
    }
  } else if (commandName === 'view-candidates') {
    const electionId = interaction.options.getString('election_id');
    const candidates = await getCandidates(electionId);
    if (candidates.length > 0) {
      const candidateList = candidates.map((candidate) => {
        return candidate.candidateName.replaceAll('\'', '');
      });
      await interaction.reply(candidateList.join('\n'));
    } else {
      await interaction.reply('No candidates found for this election');
    }
  } else if (commandName === 'cast-vote') {
    const userId = interaction.member.user.id;
    const email = interaction.options.getString('email_address');
    const electionId = interaction.options.getString('election_id');
    const candidateId = interaction.options.getString('candidate_id');

    const votedTopicId = process.env.VOTED_TOPIC_ID;
    const client = environmentSetup();

    createMessageInTopic(votedTopicId, {
      "type": "voted",
      "electionId": electionId,
      "candidateId": candidateId,
      "voterId": userId,
      "email": email,
      "origin": "discord",
      "timestamp": new Date().getSeconds(),
      'txnHash': null,
      'contractId': null,
    }, client);
  } else if (commandName === 'register-candidate') {
    const userId = interaction.member.user.id;
    const email = interaction.options.getString('email_address');
    const electionId = interaction.options.getString('election_id');
    const candidateName = interaction.options.getString('candidate_name');

    const candidateAddedTopicId = process.env.CANDIDATE_ADDED_TOPIC_ID;
    const client = environmentSetup();

    createMessageInTopic(candidateAddedTopicId, {
      "type": "candidateAdded",
      "electionId": electionId,
      "candidateId": userId,
      "candidateName": candidateName,
      "email": email,
      "origin": "discord",
      "timestamp": new Date().getSeconds(),
      'txnHash': null,
      'contractId': null,
    }, client);
  } else if (commandName === 'help') {
    await interaction.reply(`\n\n
      ***Commands***
      **/hello** - Replies with Hello!
      **/view-ongoing-elections** - View ongoing elections
      **/view-past-elections** - View past elections
      **/view-election-details** - View details of an election
      **/view-candidates** - View candidates for an election
      **/cast-vote** - Cast a vote for a candidate
      **/register-candidate** - Register as a candidate
      **/help** - Help command
    `);
  } else {
    await interaction.reply('Invalid command');
  }
});

client.login(process.env.BOT_TOKEN);

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const getMessages = async (topicId) => {
  const messages = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`)
  return messages;
}

const getElections = async () => {
  const elections = await getMessages(process.env.ELECTION_CREATED_TOPIC_ID)
  return decodeMessages(elections.data.messages);
}

const getEndedElections = async () => {
  const pastElections = await getMessages(process.env.ELECTION_ENDED_TOPIC_ID)
  return decodeMessages(pastElections.data.messages);
}

const getOngoingElections = async () => {
  const createdElections = await getElections();
  const endedElections = await getEndedElections();
  const endedElectionIds = new Set(endedElections.map((election) => election.electionId));

  const ongoingElections = createdElections.filter((election) => !endedElectionIds.has(election.electionId));
  return ongoingElections;
}

const getCandidates = async (electionId) => {
  const candidates = await getMessages(process.env.CANDIDATE_ADDED_TOPIC_ID)
  const decodedMessages = decodeMessages(candidates.data.messages);
  return decodedMessages.filter((message) => message.electionId === electionId);
}

const decodeMessages = (messages) => {
  return messages.map((message) => {
    const decodedMessage = atob(message.message);
    return JSON.parse(decodedMessage);
  });
}
