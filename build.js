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
