const chalk = require('chalk');
const ora = require('ora');
const { isAuthenticated } = require('../config/store');
const { createTunnel } = require('../api/client');
const TunnelClient = require('../tunnel/client');

/**
 * Start Command
 * Creates tunnel and starts forwarding
 */

const startCommand = async (options) => {
    // Check authentication
    if (!isAuthenticated()) {
        console.log(chalk.red('\n❌ Not logged in'));
        console.log(chalk.gray('Please login first: localbridge login\n'));
        process.exit(1);
    }

    const port = parseInt(options.port, 10);

    if (isNaN(port) || port < 1 || port > 65535) {
        console.log(chalk.red('\n❌ Invalid port number'));
        console.log(chalk.gray('Port must be between 1 and 65535\n'));
        process.exit(1);
    }

    console.log(chalk.blue.bold('\n🚇 LocalBridge Tunnel\n'));

    try {
        // Create tunnel
        const spinner = ora('Creating tunnel...').start();
        const tunnel = await createTunnel();
        spinner.succeed(chalk.green('Tunnel created!'));

        console.log(chalk.gray(`Tunnel ID: ${tunnel.id}`));
        console.log(chalk.bold.cyan(`\n🌐 Public URL: ${tunnel.publicUrl}`));
        console.log(chalk.gray(`🔗 Forwarding to: http://localhost:${port}\n`));

        // Connect WebSocket
        const client = new TunnelClient(tunnel.id, port);
        await client.connect();

        // Start heartbeat
        client.startHeartbeat();

        console.log(chalk.green('✅ Tunnel is active!'));
        console.log(chalk.gray('Press Ctrl+C to stop\n'));

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n⚠️  Shutting down tunnel...'));
            client.close();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            client.close();
            process.exit(0);
        });
    } catch (error) {
        console.log(chalk.red('\n❌ Failed to start tunnel'));

        if (error.response) {
            const message = error.response.data?.error || 'Unknown error';
            console.log(chalk.red(`Error: ${message}\n`));
            process.exit(1);
        } else if (error.request) {
            console.log(chalk.red('Error: Cannot connect to server'));
            console.log(chalk.gray('Make sure the tunnel server is running\n'));
            // Retry on connection failure too
            setTimeout(() => startCommand(options), 5000);
        } else {
            console.log(chalk.red(`Error: ${error.message}\n`));
            process.exit(1);
        }
    }
};

module.exports = startCommand;
