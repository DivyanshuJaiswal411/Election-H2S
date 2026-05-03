import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
const { MessageChannel, MessagePort } = require('node:worker_threads');

// Polyfills for Node environment in Jest
// MUST assign these to global BEFORE requiring undici
Object.assign(global, { 
  TextEncoder, 
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  MessageChannel,
  MessagePort
});

const { Request, Response, Headers, fetch } = require('undici');

Object.assign(global, { 
  Request,
  Response,
  Headers,
  fetch
});
