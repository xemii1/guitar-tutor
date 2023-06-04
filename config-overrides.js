module.exports = {
    webpack: function(config, env) {
        config.resolve.alias['path'] = require.resolve('path-browserify');
        config.resolve.alias['fs'] = require.resolve('browserify-fs');
        config.resolve.alias['buffer'] = require.resolve('buffer/');
        config.resolve.alias['util'] = require.resolve('util/');
        config.resolve.alias['stream'] = require.resolve('stream-browserify');
        return config;
    }
}