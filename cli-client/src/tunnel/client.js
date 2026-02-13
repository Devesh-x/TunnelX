const WebSocket = require('ws');
const chalk = require('chalk');
const axios = require('axios');
const { getToken, getServerUrl } = require('../config/store');

/**
 * Tunnel Client
 * Manages WebSocket connection and request forwarding
 */

class TunnelClient {
    constructor(tunnelId, localPort) {
        this.tunnelId = tunnelId;
        this.localPort = localPort;
        this.ws = null;
        this.connected = false;
    }

    /**
     * Connect to tunnel server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            const token = getToken();
            const serverUrl = getServerUrl();

            // Convert HTTP URL to WebSocket URL
            const wsUrl = serverUrl.replace('http://', 'ws://').replace('https://', 'wss://');
            const url = `${wsUrl}/ws?token=${token}`;

            // Create public URL (path-based for Render free tier support)
            // https://project.onrender.com/t/tunnel-id
            this.publicUrl = `${serverUrl}/t/${this.tunnelId}`;

            console.log(chalk.gray(`Connecting to ${wsUrl}...`));

            this.ws = new WebSocket(url);

            // Connection opened
            this.ws.on('open', () => {
                this.connected = true;
                console.log(chalk.green('✅ Connected to tunnel server'));

                // Register tunnel
                this.registerTunnel();
                resolve();
            });

            // Receive messages
            this.ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    await this.handleMessage(message);
                } catch (error) {
                    console.error(chalk.red('Error handling message:'), error.message);
                }
            });

            // Connection closed
            this.ws.on('close', (code, reason) => {
                this.connected = false;
                console.log(chalk.yellow(`\n⚠️  Connection closed (${code}): ${reason || 'Unknown'}`));

                // Don't exit, try to reconnect
                console.log(chalk.gray('Configuring auto-reconnect in 3s...'));
                setTimeout(() => this.connect(), 3000);
            });

            // Connection error
            this.ws.on('error', (error) => {
                console.error(chalk.red('WebSocket error:'), error.message);
                reject(error);
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (!this.connected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }

    /**
     * Register tunnel with server
     */
    registerTunnel() {
        this.send({
            type: 'register',
            tunnelId: this.tunnelId,
        });
    }

    /**
     * Handle incoming messages
     */
    async handleMessage(message) {
        switch (message.type) {
            case 'connected':
                console.log(chalk.gray(message.message));
                break;

            case 'registered':
                console.log(chalk.green(`✅ Tunnel registered: ${message.tunnelId}`));
                break;

            case 'request':
                await this.handleRequest(message);
                break;

            case 'pong':
                // Heartbeat response
                break;

            default:
                console.log(chalk.gray(`Unknown message type: ${message.type}`));
        }
    }

    /**
     * Handle incoming HTTP request
     */
    async handleRequest(message) {
        const { requestId, method, url, headers, body } = message;

        console.log(chalk.cyan(`← ${method} ${url}`));

        try {
            // Forward request to localhost
            const response = await axios({
                method,
                url: `http://localhost:${this.localPort}${url}`,
                headers,
                data: body,
                validateStatus: () => true, // Accept any status code
            });

            // Send response back to server
            this.send({
                type: 'response',
                requestId,
                response: {
                    statusCode: response.status,
                    headers: response.headers,
                    body: response.data,
                },
            });

            console.log(chalk.green(`→ ${response.status} ${response.statusText}`));
        } catch (error) {
            console.error(chalk.red(`Error forwarding request: ${error.message}`));

            // Send error response
            this.send({
                type: 'response',
                requestId,
                response: {
                    statusCode: 502,
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        error: 'Bad Gateway',
                        message: `Failed to connect to localhost:${this.localPort}`,
                    }),
                },
            });
        }
    }

    /**
     * Send message to server
     */
    send(data) {
        if (this.ws && this.connected) {
            this.ws.send(JSON.stringify(data));
        }
    }

    /**
     * Start heartbeat
     */
    startHeartbeat() {
        setInterval(() => {
            if (this.connected) {
                this.send({ type: 'ping' });
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Close connection
     */
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

module.exports = TunnelClient;
