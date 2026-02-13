const chalk = require('chalk');
const { clearAuth, getEmail } = require('../config/store');

/**
 * Logout Command
 * Clears saved authentication
 */

const logoutCommand = () => {
    const email = getEmail();

    if (!email) {
        console.log(chalk.yellow('\n⚠️  Not logged in\n'));
        return;
    }

    clearAuth();
    console.log(chalk.green(`\n✅ Logged out from ${email}`));
    console.log(chalk.gray('Token cleared\n'));
};

module.exports = logoutCommand;
