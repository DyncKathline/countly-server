var plugin = {},
    common = require('../../../api/utils/common.js'),
    plugins = require('../../pluginManager.js');

(function() {
    plugins.register("/", function(ob) {
        var params = ob.params,
            apiPath = ob.apiPath;
        if (apiPath === "/i" && params.qstring.device_id && params.qstring.device_id === "00000000-0000-0000-0000-000000000000") {
            common.returnMessage(params, 400, 'Ignoring device_id');
            params.cancelRequest = 'Ignoring zero IDFA device_id';
            return false;
        }
        return false;
    });
}(plugin));

module.exports = plugin;