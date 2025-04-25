# Code Obfuscation Setup for Docker Deployment

This guide will walk you through the steps necessary to set up your project to obfuscate JavaScript code during deployment to Docker using uglify-js and rimraf. By the end of this guide, you'll have an obfuscated build ready for production.

## 1. Configure the build.js Script for Code Obfuscation

Add the following scripts to your package.json:
```
"scripts": {
  "clean": "rimraf dist",
  "build": "npm run clean && mkdir dist && node ./build.js",
  "start": "node dist/app.js"
}
```
## 2. Create build.js File for Code Obfuscation

Create a build.js file with the following content:
```
const fs = require("fs");
const path = require("path");
const UglifyJS = require("uglify-js");

const PROJECT_ROOT = __dirname;
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");

function findJSFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory not found: ${dir}`);
  }

  return fs.readdirSync(dir).flatMap((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      return findJSFiles(fullPath);
    } else if (file.endsWith(".js")) {
      return [fullPath];
    }

    return [];
  });
}

function build() {
  try {
    if (!fs.existsSync(SRC_DIR)) {
      throw new Error(`SRC DIRECTORY MISSING: ${SRC_DIR}`);
    }

    const files = findJSFiles(SRC_DIR);
    if (files.length === 0) {
      throw new Error("No .js files found in src directory.");
    }

    files.forEach((file) => {
      const code = fs.readFileSync(file, "utf8");

      const result = UglifyJS.minify(code, {
        compress: true,
        mangle: {
          reserved: ["require", "module", "exports"],
        },
        output: {
          beautify: false,
          comments: false,
        },
      });

      if (result.error) {
        console.error(`Error minifying ${file}:`, result.error);
        return;
      }

      const relativePath = path.relative(SRC_DIR, file);
      const outputPath = path.join(DIST_DIR, relativePath);
      const outputDir = path.dirname(outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, result.code);
    });

    console.log("Build completed.");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

build();
```
## 3. Run the command
```
npm run build
```
## 4. Set Up Dockerfile for Code Obfuscation

Create a Dockerfile with the following content:
```
# Stage 1: Build the project with obfuscation
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```
## 5. Build and Run the Docker Image
Build the Docker image:
```
docker build -t code-obfuscation .
```
Run the Docker container:
```
docker run -p 3000:3000 code-obfuscation
```
## 6. Verify the Obfuscation

To confirm your code has been properly obfuscated:

### Method 1: Direct Container Inspection
#### To find the container name or ID, you can use:
```
docker ps
```
#### To go inside a running Docker container and see its files or code
```
docker exec -it <container_name_or_id> /bin/sh
```
#### Navigate to the dist directory and view a file
```
ls
cd /app/dist
cat app.js
```
## Conclusion

You have now successfully implemented a robust code protection solution by:

✅ **Setting up JavaScript obfuscation** using uglify-js  
✅ **Automating the process** through your build pipeline  
✅ **Containerizing the application** with Docker for production deployment
