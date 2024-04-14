import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";

export const createMessageInTopic = async (topicId, message, client) => {
    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(JSON.stringify(message)).execute(client);
    
    console.log(`Message submitted to topic: ${transaction.toString()}`);
}