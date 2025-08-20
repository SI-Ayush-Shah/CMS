import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../../config/env";

type GoogleGenaiModelParams = {
    modelName: string;
    temperature: number;
}

export const createGoogleGenaiModel = ({modelName, temperature}: GoogleGenaiModelParams) : ChatGoogleGenerativeAI => {

    const model = new ChatGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
    model: modelName, 
    temperature: temperature,
  });

  return model
}
