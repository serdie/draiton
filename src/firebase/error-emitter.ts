// Defines a global event emitter for handling application-wide errors.

import { EventEmitter } from 'events';
export const errorEmitter = new EventEmitter();
