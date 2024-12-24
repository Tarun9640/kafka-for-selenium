"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
const kafka = new kafkajs_1.Kafka({
    clientId: "selenium-app",
    brokers: ["13.203.154.186:9092"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "selenium-app" });
// Function to create the topic if it doesn't exist
function createTopic() {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = kafka.admin();
        yield admin.connect();
        // Check if the topic exists
        const topicExists = yield admin.listTopics();
        console.log(topicExists);
        if (!topicExists.includes("selenium-automation")) {
            yield admin.createTopics({
                topics: [
                    {
                        topic: "selenium-automation",
                        numPartitions: 3, // 3 partitions
                        replicationFactor: 1, // Single replica (assuming 1 broker)
                    },
                ],
            });
            console.log("Topic 'selenium-automation' created with 3 partitions");
        }
        else {
            console.log("Topic 'selenium-automation' already exists");
        }
        yield admin.disconnect();
    });
}
// Function to produce messages to the topic
function produceMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.connect();
        yield producer.send({
            topic: "selenium-automation",
            messages: [{ value: "Triggered from Selenium" }],
        });
        console.log("Messages sent to topic 'selenium-automation'");
        yield producer.disconnect();
    });
}
// Function to consume messages from the topic
function consumeMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        yield consumer.connect();
        yield consumer.subscribe({ topic: "selenium-automation", fromBeginning: true });
        console.log("Consumer started...");
        yield consumer.run({
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c;
                console.log({
                    partition,
                    key: (_b = message.key) === null || _b === void 0 ? void 0 : _b.toString(),
                    value: (_c = message.value) === null || _c === void 0 ? void 0 : _c.toString(),
                });
            }),
        });
    });
}
// HTTP endpoint to trigger message production
app.post("/trigger-produce", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield produceMessages();
        res.send("Messages have been sent to Kafka topic 'selenium-automation'");
    }
    catch (error) {
        console.error("Error producing messages:", error);
        res.status(500).send("Error producing messages");
    }
}));
// HTTP endpoint to start message consumption
app.get("/start-consume", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield consumeMessages();
        res.send("Consumer started and messages will be processed.");
    }
    catch (error) {
        console.error("Error starting consumer:", error);
        res.status(500).send("Error starting consumer");
    }
}));
// Start the Express server
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield createTopic(); // Ensure the topic exists before starting the server
    console.log(`Server running at http://localhost:${port}`);
}));
