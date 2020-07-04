module.exports = {
  apps: [{
    script: './dist/server.js',
    watch: ['./dist/server.js', './dist/views'],
    log_file: 'nodePackMonitor.log',
    time: true,
    // for pm2-logrotate
    max_size: "3M",
    retain: "all",
    compress: true,
    dateFormat: "YYYY-MM-DD_HH-mm-ss",
    workerInterval: 10,
    rotateInterval: "0 0 0 * * ?",
    rotateModule: true
  }]
};
