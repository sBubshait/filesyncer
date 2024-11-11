#!/bin/bash

if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it first."
    exit 1
fi

npm install pm2 -g

## Install the CLI tool
# cd cli
# npm install

# npm link

## Install the Desktop App
cd Desktop
npm install

## Install Watcher
cd src/watcher
npm install

echo "Setup completed successfully!"
