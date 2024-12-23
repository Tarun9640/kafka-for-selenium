import { Kafka } from "kafkajs";
import express from "express";

const app = express();
const port = 3000;

const kafka = new Kafka({
  clientId: "selenium-app",
  brokers: ["13.203.154.186:9092"], 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "selenium-app" });

// Function to create the topic if it doesn't exist
async function createTopic() {
  const admin = kafka.admin();
  await admin.connect();

  // Check if the topic exists
  const topicExists = await admin.listTopics();
  console.log(topicExists);
  
  if (!topicExists.includes("selenium-automation")) {
    await admin.createTopics({
      topics: [
        {
          topic: "selenium-automation",
          numPartitions: 3,  // 3 partitions
          replicationFactor: 1,  // Single replica (assuming 1 broker)
        },
      ],
    });
    console.log("Topic 'selenium-automation' created with 3 partitions");
  } else {
    console.log("Topic 'selenium-automation' already exists");
  }

  await admin.disconnect();
}

// Function to produce messages to the topic
async function produceMessages() {
  await producer.connect();
  await producer.send({
    topic: "selenium-automation",
    messages: [{ value: "Triggered from Selenium" }],
  });
  console.log("Messages sent to topic 'selenium-automation'");
  await producer.disconnect();
}

// Function to consume messages from the topic
async function consumeMessages() {
  await consumer.connect();
  await consumer.subscribe({ topic: "selenium-automation", fromBeginning: true });

  console.log("Consumer started...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        key: message.key?.toString(),
        value: message.value?.toString(),
      });
    },
  });
}

// HTTP endpoint to trigger message production
app.post("/trigger-produce", async (req, res) => {
  try {
    await produceMessages();
    res.send("Messages have been sent to Kafka topic 'selenium-automation'");
  } catch (error) {
    console.error("Error producing messages:", error);
    res.status(500).send("Error producing messages");
  }
});

// HTTP endpoint to start message consumption
app.get("/start-consume", async (req, res) => {
  try {
    await consumeMessages();
    res.send("Consumer started and messages will be processed.");
  } catch (error) {
    console.error("Error starting consumer:", error);
    res.status(500).send("Error starting consumer");
  }
});

// Start the Express server
app.listen(port, async () => {
  await createTopic(); // Ensure the topic exists before starting the server
  console.log(`Server running at http://localhost:${port}`);
});
