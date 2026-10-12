import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const authPath = path.join(os.homedir(), '.notebooklm-mcp', 'auth.json');

console.log('====================================================');
console.log(' Google NotebookLM MCP Notebook Creator ');
console.log('====================================================\n');

if (!fs.existsSync(authPath)) {
  console.error('❌ Google NotebookLM session not found at: ' + authPath);
  console.log('\n👉 Please run the interactive login in your terminal:');
  console.log('   npm run auth');
  console.log('   (or: npx notebooklm-mcp-server auth)\n');
  console.log('Once you log in and the browser saves your session cookies, re-run:');
  console.log('   node scripts/create-notebooklm-notebooks.mjs\n');
  process.exit(1);
}

const specialties = [
  {
    title: 'Mathematics Chatbot: Copilot Studio & Conversational AI',
    sourceFile: path.join(projectRoot, 'notebooks', '01_Conversational_AI_and_Copilot_Studio_Engineering.md'),
    sourceTitle: 'Copilot Studio & Conversational Pedagogy Guide'
  },
  {
    title: 'Mathematics Chatbot: Computational Math & Symbolic AI',
    sourceFile: path.join(projectRoot, 'notebooks', '02_Computational_Mathematics_and_Symbolic_AI.md'),
    sourceTitle: 'Computational Math & Symbolic Reasoning Architecture'
  }
];

class McpClient {
  constructor(serverPath) {
    this.server = spawn('node', [serverPath], { cwd: projectRoot });
    this.buffer = '';
    this.pending = new Map();
    this.msgId = 1;

    this.server.stdout.on('data', chunk => {
      this.buffer += chunk.toString();
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) {
              reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            } else {
              resolve(msg.result);
            }
          }
        } catch {
          // ignore non-json lines
        }
      }
    });

    this.server.stderr.on('data', chunk => {
      // debug logs from server
      const str = chunk.toString().trim();
      if (str && !str.includes('running on stdio')) {
        console.log(`[MCP Server] ${str}`);
      }
    });
  }

  sendRequest(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      this.server.stdin.write(payload);
    });
  }

  async callTool(name, args = {}) {
    const res = await this.sendRequest('tools/call', { name, arguments: args });
    if (res.isError) {
      const errText = res.content?.map(c => c.text).join('\n') || 'Tool call error';
      throw new Error(errText);
    }
    return res;
  }

  close() {
    this.server.kill();
  }
}

async function run() {
  const serverPath = path.join(projectRoot, 'node_modules', 'notebooklm-mcp-server', 'dist', 'index.js');
  const client = new McpClient(serverPath);

  try {
    console.log('Connecting to NotebookLM MCP Server...');
    await client.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'notebook-creator', version: '1.0' }
    });

    console.log('✅ Connected.\n');

    for (const spec of specialties) {
      console.log(`📚 Creating Notebook: "${spec.title}"...`);
      const createRes = await client.callTool('notebook_create', { title: spec.title });
      
      let notebookId = '';
      try {
        const parsed = JSON.parse(createRes.content[0].text);
        notebookId = parsed.notebook_id;
      } catch {
        notebookId = createRes.content[0].text;
      }

      console.log(`   Notebook created! ID: ${notebookId}`);
      console.log(`   URL: https://notebooklm.google.com/notebook/${notebookId}`);

      if (fs.existsSync(spec.sourceFile)) {
        console.log(`   Uploading source guide: ${path.basename(spec.sourceFile)}...`);
        const content = fs.readFileSync(spec.sourceFile, 'utf8');
        await client.callTool('notebook_add_text', {
          notebook_id: notebookId,
          title: spec.sourceTitle,
          content: content
        });
        console.log(`   ✅ Source successfully ingested into notebook.\n`);
      }
    }

    console.log('🎉 All specialty notebooks created and populated successfully in Google NotebookLM!');
  } catch (err) {
    console.error('❌ Error during notebook creation:', err.message);
  } finally {
    client.close();
  }
}

run();
