#!/bin/bash

if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it first."
    exit 1
fi

npm install pm2 -g

cd client
npm install

npm link

echo "Setup completed successfully!"
