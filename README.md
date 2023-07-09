# 📎FileSyncer ☁️

FileSyncer is a powerful command-line interface (CLI) tool that allows for real-time synchronization of a local directory with an Amazon Web Services (AWS) S3 bucket. By leveraging Node.js, this tool runs as a background service, ensuring your files remain updated on AWS automatically. 🤖

## 🚀Getting Started 

### Prerequisites

1. Ensure that you have Node.js installed. If not, download it [here](https://nodejs.org/en/download/).

2. Install the PM2 Runtime. PM2 is a production process manager for Node.js applications with a built-in load balancer. Install it globally by running the following command in your terminal:

```bash
npm install pm2 -g
```

### 🔧Installation 

1. Clone the repository to your local machine:

```bash
git clone https://github.com/sBubshait/filesyncer.git
```

2. Navigate into the `filesyncer` directory and install the dependencies:

```bash
cd filesyncer && npm install
```

3. Navigate into the `src` directory and install any remaining dependencies:

```bash
cd src && npm install
```

4. Navigate back to the `filesyncer-s3` directory:

```bash
cd ..
```

5. Link the package for global use:

```bash
npm link
```

Now, you're all set to start using FileSyncer S3!

## 💻Usage 

Run the command `filesyncer` in your terminal and follow the prompts. Your local directory will be synced with your specified AWS S3 bucket in real-time.

## ✏️To-Do 

- [ ] Support syncing more than one directory.
- [ ] Introduce better error handling and reporting.

Your feedback and contributions are welcome! 😀

## 📜License 

This project is licensed under the MIT License.

Happy coding! ❤️
```