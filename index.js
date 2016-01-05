var util = require('./util.js');
var request = require('request').defaults({
    baseUrl: 'https://api-ssl.bitly.com/'
});

var pickInputs = {
        'shortUrl': 'shortUrl',
        'hash': 'hash',
        'expand_user': 'expand_user'
    },
    pickOutputs = {
        'short_url': { keyName: 'data.info', fields: ['short_url'] },
        'hash': { keyName: 'data.info', fields: ['hash'] },
        'user_hash': { keyName: 'data.info', fields: ['user_hash'] },
        'global_hash': { keyName: 'data.info', fields: ['global_hash'] },
        'title': { keyName: 'data.info', fields: ['title'] },
        'created_by': { keyName: 'data.info', fields: ['created_by'] },
        'created_at': { keyName: 'data.info', fields: ['created_at'] }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('bitly_access_token'),
            api = '/v3/info';

        if (!token)
            return this.fail('A [bitly_access_token] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        inputs.access_token = token;
        request.get({uri: api, qs: inputs, json: true}, function (error, response, body) {
            if (error)
                this.fail(error);
            else if (body && body.status_code !== 200)
                this.fail(body);
            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};
