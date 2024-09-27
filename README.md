# FileSyncer ☁️

FileSyncer is a powerful real-time tool to sync your files and directories between different devices using AWS S3. It is equipped with a web interface to manage your files and directories in addition to the command line interface. It is built using NodeJS, ExpressJS, AWS S3, NextJS, WebSocket, among others.

## Features
- Real-time file sync: Using WebSocket, the changes made in one device will be reflected in AWS S3 and the web interface of all connected devices in real-time.
- One-time setup: You only need to set up the configuration once and you are good to go.
- Web interface: Access your files and directories from anywhere using the web interface.
- Command line interface: Perform all the operations using the command line interface.
- Secure: All requests are authenticated using JWT.

## Installation
1. Clone the repository.
```bash
git clone https://github.com/sBubshait/filesyncer.git
```

2. Navigate to the cloned repository.
```bash
cd filesyncer
```

3. Install the client on your desktop by running the install script. (You may need to run it as an administrator)
```bash
./install.sh
```

4. Run the central API and the website using Docker.
```bash
docker compose up
```

5. You will need to setup the configuration for the first time by running the setup script.
```bash
filesyncer
```
Follow the instructions to link your AWS S3 bucket.

And that's it! You are ready to sync your files and directories.

## Usage

### Web Interface
1. Open your browser and navigate to `http://localhost:3001` to access the web interface.
2. Login using the credentials. The default credentials are:
   - Username: `admin`
   - Password: `admin`
   These can be changed in the .env file.

### Command Line Interface
1. Run the command line interface by running the following command.
```bash
filesyncer
```
2. Follow the instructions to perform the desired operation, e.g., add a new folder to sync.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing
All contributions are welcome!


Have fun and don't worry about your files anymore! 🚀
