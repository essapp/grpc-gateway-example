const { exec, spawn } = require('child_process');
const { parallel, series } = require('gulp');
const { join } = require('path');
const { stat, readFile } = require('fs/promises');
const { H3, handleCors, serve, serveStatic } = require('h3');

const buildGS = () => {
  const cmd = 'go build -o bin/example-gs ../cmd/example-grpc-server';
  return exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Clean failed: ${error}`);
    } else {
      console.log('build grpc server success');
    }
  });
}

const buildGW = () => {
  const cmd = 'go build -o bin/example-gw ../cmd/example-gateway-server';
  return exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Clean failed: ${error}`);
    } else {
      console.log('build gw server success');
    }
  });
}

const runGS = (done) => {
  const gs = spawn('bin/example-gs', [], { stdio: 'inherit' });
  process.on('exit', () => {
    gs.kill();
  });
  return done();
}

const runGW = (done) => {
  const gw = spawn('bin/example-gw', ['--openapi_dir', join(__dirname, "../proto/examplepb"),], { stdio: 'inherit' });
  process.on('exit', () => {
    gw.kill();
  });
  return done();
}

const server = (done) => {
  const app = new H3({ debug: true });
  serve(
    app.all('/**', (event) => {
      if (handleCors(event, { origin: "*" })) {
        return;
      }
      return serveStatic(event, {
        indexNames: ['/index.html'],
        getContents: (id) => readFile(join('public', id)),
        getMeta: async (id) => {
          const stats = await stat(join('public', id)).catch(() => { });
          if (stats?.isFile()) {
            return {
              size: stats.size,
              mtime: stats.mtimeMs,
            };
          }
        },
      });
    }
    )
  );
  return done();
}

exports.buildGS = buildGS;
exports.default = series(parallel(buildGS, buildGW), runGS, runGW, server);