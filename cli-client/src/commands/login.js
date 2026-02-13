const prompts = require('prompts');
const chalk = require('chalk');
const ora = require('ora');
const { login } = require('../api/client');
const { saveAuth } = require('../config/store');

/**
 * Login Command
 * Authenticates user and saves token
 */

const loginCommand = async () => {
    console.log(chalk.blue.bold('\n🔐 LocalBridge Login\n'));

    try {
        // Prompt for credentials
        const response = await prompts([
            {
                type: 'text',
                name: 'email',
                message: 'Email:',
                validate: (value) => {
                    if (!value) return 'Email is required';
                    if (!value.includes('@')) return 'Invalid email format';
                    return true;
                },
            },
            {
                type: 'password',
                name: 'password',
                message: 'Password:',
                validate: (value) => {
                    if (!value) return 'Password is required';
                    if (value.length < 6) return 'Password must be at least 6 characters';
                    return true;
                },
            },
        ]);

        // Check if user cancelled
        if (!response.email || !response.password) {
            console.log(chalk.yellow('\n⚠️  Login cancelled'));
            process.exit(0);
        }

        // Show loading spinner
        const spinner = ora('Authenticating...').start();

        // Login
        const data = await login(response.email, response.password);

        // Save credentials
        saveAuth(data.token, data.user.email);

        spinner.succeed(chalk.green('✅ Login successful!'));
        console.log(chalk.gray(`Logged in as: ${data.user.email}`));
        console.log(chalk.gray('Token saved locally\n'));
        console.log(chalk.cyan('💡 You can now create tunnels with: localbridge start --port 3000\n'));
    } catch (error) {
        console.log(chalk.red('\n❌ Login failed'));

        if (error.response) {
            const message = error.response.data?.error || 'Invalid credentials';
            console.log(chalk.red(`Error: ${message}\n`));
        } else if (error.request) {
            console.log(chalk.red('Error: Cannot connect to server'));
            console.log(chalk.gray('Make sure the tunnel server is running\n'));
        } else {
            console.log(chalk.red(`Error: ${error.message}\n`));
        }

        process.exit(1);
    }
};

module.exports = loginCommand;
