#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
import os from 'os';
import { authenticateCredentials } from './src/db.js';
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";
import { execSync } from 'child_process';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPath = path.resolve(__dirname, './config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const envFilePath = path.resolve(__dirname, './.env');


const shortcuts = {
    Desktop: path.join(os.homedir(), 'Desktop'),
    Documents: path.join(os.homedir(), 'Documents'),
    Downloads: path.join(os.homedir(), 'Downloads'),
    Home: os.homedir(),
};


console.clear();
console.log(
    chalk.yellow(
        figlet.textSync('FileSyncer', { horizontalLayout: 'full' })
    )
);
console.log(chalk.green("\nWelcome to FileSyncer! The folder syncing program for S3 buckets.\n"));


if (config.hasBeenSetup) {
    const isSyncing = await checkStatus();

    if (isSyncing) {
    console.log(chalk.green("Status: ") + chalk.bgGreen(`Syncing`) + chalk.green(` - Watching (${config.foldersToWatch.length}) folder(s)\n`));
    } else {
        console.log(chalk.green("Status: ") + chalk.bgRed("Not Syncing\n"));
    }
    inquirer
    .prompt([
        {
            name: 'task',
            type: 'list',
            message: 'What do you want to do?',
            choices: [
                `${ isSyncing ? "Stop Syncing" : "Start Syncing"}`, 
                'Add Directory to Sync', 
                'Update AWS Credentials', 
                'Exit'
            ],
        },
    ])
    .then(answers => {
        switch(answers.task) {
            case 'Start Syncing':
                startWatching();
                console.log(chalk.blueBright("Started Syncing!"));
                break;
            case 'Stop Syncing':
                stopWatching();
                console.log(chalk.blueBright("Stopped Syncing. You will have to restart the program to start syncing again!"));
                break;
            case 'Add Directory to Sync':
                addDirectory();
                break;
            case 'Update Syncing Folder / AWS Credentials':
                startSetup();
                break;
            case 'Exit':
                console.log("See you soon...");
                process.exit(0);
                break;
        }
    });

} else {
    console.log(chalk.green("Status: ") + chalk.bgRed("Not Syncing - Awaiting Setup\n"));

    inquirer
    .prompt([
        {
            name: 'task',
            type: 'list',
            message: 'What do you want to do?',
            choices: ['Start Setup!', 'Exit'],
        },
    ])
    .then(answers => {
        switch(answers.task) {
            case 'Start Setup!':
                startSetup();
                break;
            case 'Exit':
                console.log("See you soon...");
                process.exit(0);
                break;
        }
    });
}

const startSetup = async () => {
    const { username, password } = await inquirer.prompt([
        {
            name: 'username',
            type: 'input',
            message: 'Enter your FileSyncer username',
            validate: value => value.length ? true : 'Please enter your FileSyncer username.',
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your FileSyncer password',
            validate: value => value.length ? true : 'Please enter your FileSyncer password.',
        },
    ]);

    let spinner = ora('Validating credentials...').start();

    try {
        const token = await authenticateCredentials(username, password);

        if (!token) {
            spinner.fail('Cannot validate credentials. Please check your login details.');
            return;
        }

        spinner.succeed('Credentials validated!');
        let envContent = `USERNAME=${username}\nPASSWORD=${password}\n`;
        fs.appendFileSync(envFilePath, envContent);

    } catch (error) {
        spinner.fail('Error validating credentials. Please check your login details.');
        return;
    }

    const { accessKeyId, secretAccessKey, bucketName, Region } = await inquirer.prompt([
        {
            name: 'accessKeyId',
            type: 'input',
            message: 'Enter your AWS Access Key ID. This will only be saved locally:',
            validate: value => value.length ? true : 'Please enter your AWS Access Key ID.',
        },
        {
            name: 'secretAccessKey',
            type: 'input',
            message: 'Enter your AWS Secret Access Key:',
            validate: value => value.length ? true : 'Please enter your AWS Secret Access Key.',
        },
        {
            name: 'bucketName',
            type: 'input',
            message: 'Enter your AWS Bucket Name:',
            validate: value => value.length ? true : 'Please enter your AWS Bucket Name.',
        },
        {
            name: 'Region',
            type: 'input',
            message: 'Enter your AWS Bucket Region:',
            validate: value => value.length ? true : 'Please enter your AWS Bucket Region.',
        },
    ]);

    spinner = ora('Validating AWS credentials...').start();

   
    try {
        const isValid = await validateCredentials(accessKeyId, secretAccessKey, bucketName, Region);
        if (!isValid) {
            spinner.fail('AWS credentials validation failed. Please check your credentials.');
            return;
        }

        spinner.succeed('AWS credentials validated!');

        console.log("Syncing has started!");

        let envContent = `AWS_ACCESS_KEY_ID=${accessKeyId}\nAWS_SECRET_ACCESS_KEY=${secretAccessKey}\nAWS_BUCKET_NAME=${bucketName}\nAWS_REGION=${Region}\n`;
        fs.appendFileSync(envFilePath, envContent);
        config.foldersToWatch = [];

        updateConfig();
        startWatching();
    } catch (err) {
        console.log(err)
        spinner.fail('An error occurred during AWS credentials validation. Please check your credentials.');
    }
};

const addDirectory = async () => {
    let absFolderPath;
    const { folderPath } = await inquirer.prompt([
        {   
            name: 'folderPath',
            type: 'input',
            message: 'Enter the folder path to sync (shortcuts: Desktop, Documents, Downloads, Home): [e.g. Desktop/MyFolder]',
            validate: value => {
                if (value.length) {
                    const fullPath = resolvePath(value);
                    if (!fs.existsSync(fullPath)) {
                        return 'Please enter a valid folder path.';
                    } else {
                        absFolderPath = fullPath;
                        return true;
                    }
                } else {
                    return 'Please enter a valid folder path.';
                }
            },
        },
    ]);

    const filesCount = countFilesInDir(absFolderPath);

    const { confirm } = await inquirer.prompt([
        {
            name: 'confirm',
            type: 'confirm',
            message: `There are ${filesCount} file(s) in the directory: ${absFolderPath}. Are you sure you want to sync this folder?`,
        },
    ]);

    if (!confirm) {
        return
    }

    if (!config.foldersToWatch) {
        config.foldersToWatch = [];
    }

    config.foldersToWatch.push(absFolderPath);

    updateConfig();
    restartWatching();
    console.log(`Added '${absFolderPath}' to the list of folders to sync successfully!`);
};

function updateConfig() {
    config.hasBeenSetup = true;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

const watchPath = path.resolve(__dirname, './src/watch.js');

const startWatching = () => {
    try {
        execSync(`pm2 start ${watchPath} --name filesyncer`, { stdio: 'inherit' });
        
        execSync('pm2 save', { stdio: 'inherit' });

        const startupScript = execSync('pm2 startup', { stdio: 'inherit' });
        if (startupScript)
            execSync(startupScript.toString(), { stdio: 'inherit' });

        console.log('Started watching.');
    } catch (error) {
        console.error(`Error while starting to watch: ${error}`);
    }
};

const restartWatching = () => {
    try {
        execSync('pm2 restart filesyncer', { stdio: 'inherit' });
        console.log('Restarted watching.');
    } catch (error) {
        console.error(`Error while restarting watch: ${error}`);
    }
};

const stopWatching = () => {
    try {
        execSync('pm2 stop filesyncer', { stdio: 'inherit' });
        console.log('Stopped watching.');
    } catch (error) {
        console.error(`Error while stopping watch: ${error}`);
    }
};

async function checkStatus () {
    try {
        let output = execSync('pm2 show filesyncer', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

        if (output.includes("doesn't exist") || output.includes('errored') || output.includes('stopped')) {
            return false;
        } else {
            return true;
        }

    } catch (error) {
        return false;
    }
};


const countFilesInDir = (dirPath) => {
    let count = 0;
    const list = fs.readdirSync(dirPath);

    list.forEach((file) => {
        file = path.resolve(dirPath, file);

        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            // Recurse into subdirectories
            count += countFilesInDir(file);
        } else {
            count++;
        }
    });

    return count;
};


async function validateCredentials(accessKey, secretAccessKey, bucket, region) {
    try {
        const S3 = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretAccessKey,
            },
        });

        // Try to list objects in the bucket
        await S3.send(new ListObjectsCommand({ Bucket: bucket, Region: region }));
        return true;
        
    } catch(err) {
        return false;
    }
}

function resolvePath (inputPath) {
    const [first, ...rest] = inputPath.split(path.sep);
    if (Object.keys(shortcuts).includes(first)) {
        return path.join(shortcuts[first], ...rest);
    } else {
        return path.resolve(inputPath);
    }
}
