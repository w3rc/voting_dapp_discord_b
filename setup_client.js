import { Client, Hbar } from "@hashgraph/sdk";
import 'dotenv/config'

export const environmentSetup = () => {
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_DER_ENCODED_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    //Create your Hedera Testnet client
    const client = Client.forTestnet();

    //Set your account as the client's operator
    client.setOperator(myAccountId, myPrivateKey);

    //Set the default maximum transaction fee (in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(10));

    //Set the maximum payment for queries (in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(10));

    return client;
}