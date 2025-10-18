import {genkit} from 'genkit';
import {googleAI, googleSearch} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [googleAI(), googleSearch()],
});
