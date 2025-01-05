# WordPress MCP Server

A Model Context Protocol (MCP) server for WordPress integration, compatible with Windows, macOS, and Linux.

## Overview

This MCP server enables interaction with WordPress sites through the WordPress REST API. It provides tools for creating, retrieving, and updating posts.

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```

## Configuration

Add the server to your MCP settings file:

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "node",
      "args": ["path/to/build/index.js"]
    }
  }
}
```

## Available Tools

### create_post
Creates a new WordPress post.

Parameters:
- siteUrl: WordPress site URL
- username: WordPress username
- password: WordPress application password
- title: Post title
- content: Post content
- status: (optional) 'draft' | 'publish' | 'private' (default: 'draft')

### get_posts
Retrieves WordPress posts.

Parameters:
- siteUrl: WordPress site URL
- username: WordPress username
- password: WordPress application password
- perPage: (optional) Number of posts per page (default: 10)
- page: (optional) Page number (default: 1)

### update_post
Updates an existing WordPress post.

Parameters:
- siteUrl: WordPress site URL
- username: WordPress username
- password: WordPress application password
- postId: ID of the post to update
- title: (optional) New post title
- content: (optional) New post content
- status: (optional) 'draft' | 'publish' | 'private'

## Security Note

For security, it's recommended to use WordPress application passwords instead of your main account password. You can generate an application password in your WordPress dashboard under Users → Security → Application Passwords.

## Example Usage

```json
{
  "tool": "create_post",
  "siteUrl": "https://your-wordpress-site.com",
  "username": "your-username",
  "password": "your-app-password",
  "title": "My New Post",
  "content": "Hello World!",
  "status": "draft"
}
```

## Requirements

- Node.js 20.0.0 or higher
- WordPress site with REST API enabled
- WordPress application password for authentication

## License

MIT License - See LICENSE file for details
