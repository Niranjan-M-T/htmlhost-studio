import { NextRequest, NextResponse } from 'next/server';
import { mcpToolSchemas, executeMcpTool } from '@/lib/mcp-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, method, params, id } = body;

    const originUrl = request.nextUrl.origin;

    // Handle MCP protocol initialization & tool queries
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'htmlhost-studio-agent-mcp',
            version: '1.0.0',
          },
        },
      });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: mcpToolSchemas,
        },
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;
      try {
        const toolResult = await executeMcpTool(name, toolArgs || {}, originUrl);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          },
        });
      } catch (err: any) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: err.message || 'Error executing tool',
          },
        });
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid JSON-RPC request' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'HTMLHost Studio MCP Endpoint',
    status: 'online',
    toolsCount: mcpToolSchemas.length,
    description: 'Send JSON-RPC 2.0 requests via POST to interact with HTMLHost Studio programmatically.',
  });
}
