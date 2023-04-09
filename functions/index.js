const functions = require("firebase-functions");
const fs = require("fs");

const cors = require("cors");
const express = require("express");
//const EventSource = require("eventsource");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");
const { PineconeClient } = require("@pinecone-database/pinecone");
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb" }));

admin.initializeApp();

const configuration = new Configuration({
  apiKey: "API",
});

const openai = new OpenAIApi(configuration);

const pinecone = new PineconeClient();

app.get("/", (req, res) => {
  res.send("Hello");
});

const getPineconeIndex = async () => {
  await pinecone.init({
    environment: "us-central1-gcp",
    apiKey: "aae71f5b-7395-40f3-911f-45e7ad5be968",
  });
  return pinecone.Index("expereo");
};

const getEmbedding = async (query, model) => {
  const response = await openai.createEmbedding({
    model: model,
    input: [query],
  });
  return response.data.data[0].embedding;
};

const getQueryResponse = async (index, vectors) => {
  const queryRequest = {
    vector: vectors,
    topK: 15,
    includeMetadata: true,
    includeValues: true,
  };
  return await index.query({ queryRequest });
};

const getContexts = (queryResponse) => {
  return queryResponse.matches.map((match) => match.metadata.text);
};

const getAugmentedQuery = (contexts, query) => {
  return `${contexts.join("\n\n---\n\n")}\n\n-----\n\n${query}`;
};

const getChatCompletion = async (primer, augmentedQuery) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: primer },
      { role: "user", content: augmentedQuery },
    ],
  });
  return completion.data.choices[0].message.content;
};

app.get("/pinecone", async (req, res) => {
  const query = "can you tell me some last news about expereo";
  const embedModel = "text-embedding-ada-002";
  const primer = `Ybot. A ou are Q&A highly intelligent system that answers
  user questions based on the information provided by the user above
  each question. If the information can not be found in the information
  provided by the user you truthfully say "I don't know".`;

  const index = await getPineconeIndex();
  const vectors = await getEmbedding(query, embedModel);
  const queryResponse = await getQueryResponse(index, vectors);
  const contexts = getContexts(queryResponse);
  const augmentedQuery = getAugmentedQuery(contexts, query);
  const completionText = await getChatCompletion(primer, augmentedQuery);

  console.log(completionText);
  res.send(completionText);
});

app.get("/stream", async (req, res) => {
  const embedModel = "text-embedding-ada-002";
  const primer = `Ybot. A ou are Q&A highly intelligent system that answers
  user questions based on the information provided by the user above
  each question. If the information can not be found in the information
  provided by the user you truthfully say "I don't know".`;
  const query = req.query.promt;

  const index = await getPineconeIndex();
  const vectors = await getEmbedding(query, embedModel);
  const queryResponse = await getQueryResponse(index, vectors);
  const contexts = getContexts(queryResponse);
  const augmentedQuery = getAugmentedQuery(contexts, query);

  const createChatCompletionConfig = {
    model: "gpt-4",
    messages: [
      { role: "system", content: primer },
      { role: "user", content: augmentedQuery },
    ],
    temperature: 0,
    stream: true,
  };

  const responseTypeConfig = { responseType: "stream" };

  const response = await openai.createChatCompletion(
    createChatCompletionConfig,
    responseTypeConfig
  );

  res.setHeader("Content-Type", "text/event-stream");

  const processChunk = (chunk) => {
    const lines = chunk
      .toString("utf8")
      .split("\n")
      .filter((line) => line.trim().startsWith("data: "));

    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        console.log("DONE");

        break;
      }

      const json = JSON.parse(message);
      const token = json.choices[0].delta.content;
      if (token) {
        res.write(`data: ${token}\n\n`);
      }
    }
  };

  for await (const chunk of response.data) {
    processChunk(chunk);
  }
});

app.post("/transcribe", async (req, res) => {
  const { file, dialog } = req.body;

  let base64Image = file.split(";base64,").pop();

  fs.writeFileSync("audio.wav", base64Image, { encoding: "base64" });
  const readStream = fs.createReadStream("audio.wav");

  const transcriptionResponse = await openai.createTranscription(
    readStream,
    "whisper-1"
  );
  const completionResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...dialog,
      { role: "user", content: transcriptionResponse.data.text },
    ],
    temperature: 0,
    stream: true,
  });

  res.json({
    question: transcriptionResponse.data.text,
  });
});

exports.test = functions.https.onRequest(app);
