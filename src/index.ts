#!/usr/bin/env node
import axios from 'axios';
import { createInterface } from 'readline';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface WordPressError {
  message: string;
  code?: string;
}

type AxiosError = {
  response?: {
    data?: WordPressError;
  };
  message: string;
};

const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && 
         typeof error === 'object' && 
         'message' in error &&
         (error as any).response !== undefined;
};

// Get WordPress credentials from environment variables
const DEFAULT_SITE_URL = process.env.WORDPRESS_SITE_URL || '';
const DEFAULT_USERNAME = process.env.WORDPRESS_USERNAME || '';
const DEFAULT_PASSWORD = process.env.WORDPRESS_PASSWORD || '';

async function handleWordPressRequest(method: string, params: any): Promise<any> {
  try {
    const siteUrl = params.siteUrl || DEFAULT_SITE_URL;
    const username = params.username || DEFAULT_USERNAME;
    const password = params.password || DEFAULT_PASSWORD;

    if (!siteUrl || !username || !password) {
      throw new Error('WordPress credentials not provided in environment variables or request parameters');
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const client = axios.create({
      baseURL: `${siteUrl}/wp-json/wp/v2`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    switch (method) {
      case 'create_post':
        if (!params.title || !params.content) {
          throw new Error('Title and content are required for creating a post');
        }
        const createResponse = await client.post('/posts', {
          title: params.title,
          content: params.content,
          status: params.status || 'draft',
        });
        return createResponse.data;

      case 'get_posts':
        const getResponse = await client.get('/posts', {
          params: {
            per_page: params.perPage || 10,
            page: params.page || 1,
          },
        });
        return getResponse.data;

      case 'update_post':
        if (!params.postId) {
          throw new Error('Post ID is required for updating a post');
        }
        const updateData: Record<string, any> = {};
        if (params.title) updateData.title = params.title;
        if (params.content) updateData.content = params.content;
        if (params.status) updateData.status = params.status;

        const updateResponse = await client.post(
          `/posts/${params.postId}`,
          updateData
        );
        return updateResponse.data;

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(`WordPress API error: ${
        error.response?.data?.message || error.message
      }`);
    }
    throw error;
  }
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  let request: JsonRpcRequest;
  try {
    request = JSON.parse(line);
    if (request.jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version');
    }
  } catch (error) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error',
        data: error instanceof Error ? error.message : String(error)
      }
    }));
    return;
  }

  try {
    const result = await handleWordPressRequest(request.method, request.params);
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      result
    }));
  } catch (error) {
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : String(error)
      }
    }));
  }
});

process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});

console.error('WordPress MCP server running on stdin/stdout');
