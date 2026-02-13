#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const loginCommand = require('./commands/login');
const registerCommand = require('./commands/register');
const logoutCommand = require('./commands/logout');
const whoamiCommand = require('./commands/whoami');
const startCommand = require('./commands/start');

/**
 * LocalBridge CLI
 * Main entry point
 */

program
    .name('tunnelx')
    .description('Expose your localhost to the internet')
    .version('1.0.0');

// Login command
program
    .command('login')
    .description('Login to your LocalBridge account')
    .action(loginCommand);

// Register command
program
    .command('register')
    .description('Create a new LocalBridge account')
    .action(registerCommand);

// Logout command
program
    .command('logout')
    .description('Logout from your account')
    .action(logoutCommand);

// Whoami command
program
    .command('whoami')
    .description('Show current logged-in user')
    .action(whoamiCommand);

// Start command
program
    .command('start')
    .description('Start a tunnel to your localhost')
    .option('-p, --port <port>', 'Local port to expose', '3000')
    .action(startCommand);

// List command (coming next)
program
    .command('list')
    .description('List your active tunnels')
    .action(() => {
        console.log(chalk.yellow('\n⏳ List command coming soon!\n'));
    });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
