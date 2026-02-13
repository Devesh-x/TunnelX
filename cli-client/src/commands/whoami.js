const chalk = require('chalk');
const ora = require('ora');
const { getCurrentUser } = require('../api/client');
const { isAuthenticated, getEmail } = require('../config/store');

/**
 * Whoami Command
 * Shows current logged-in user
 */

const whoamiCommand = async () => {
    if (!isAuthenticated()) {
        console.log(chalk.yellow('\n⚠️  Not logged in'));
        console.log(chalk.gray('Run: localbridge login\n'));
        return;
    }

    const spinner = ora('Fetching user info...').start();

    try {
        const user = await getCurrentUser();

        spinner.stop();
        console.log(chalk.blue.bold('\n👤 Current User\n'));
        console.log(chalk.gray(`Email: ${user.email}`));
        console.log(chalk.gray(`User ID: ${user.id}`));
        console.log(chalk.gray(`Joined: ${new Date(user.createdAt).toLocaleDateString()}\n`));
    } catch (error) {
        spinner.fail(chalk.red('Failed to fetch user info'));

        if (error.response?.status === 401) {
            console.log(chalk.yellow('⚠️  Token expired. Please login again'));
            console.log(chalk.gray('Run: localbridge login\n'));
        } else {
            console.log(chalk.red(`Error: ${error.message}\n`));
        }
    }
};

module.exports = whoamiCommand;
