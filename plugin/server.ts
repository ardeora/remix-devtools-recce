import express from "express";

type SubscribeEvent = "loader_data";

class PubSub {
  subscribers: Record<string, Function[]>;

  constructor() {
    this.subscribers = {};
  }

  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(callback);
  }

  publish(event: string, data: any) {
    if (!this.subscribers[event]) {
      return;
    }

    this.subscribers[event].forEach((callback) => callback(data));
  }
}

const createServer = () => {
  const app = express();
  const loader_stats = [];
};
