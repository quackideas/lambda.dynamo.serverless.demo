/**
 * Created by quannguyen on 6/11/18.
 */
/**
 * Created by auraconsultant on 11/27/17.
 */
    // dependencies
var AWS = require('aws-sdk');
var util = require('util');

// Get reference to AWS clients
var docClient = new AWS.DynamoDB.DocumentClient({
    region:process.env.DB_REGION
});


exports.handler = (event, context, callback) => {
    try {

        var _mappingId = event.mappingId || '',
            _clientId = event.clientId || '',
            _sourceObject = (event.sourceObject !== undefined) ? event.sourceObject : null;

        if (_mappingId !== '' && _mappingId !== undefined) {

            var _params = {
                ExpressionAttributeValues: {
                    ':idValue': _mappingId
                },
                ExpressionAttributeNames: {
                    "#Id": "Id"
                },
                KeyConditionExpression: '#Id = :idValue',
                TableName: process.env.MAPPING_PROFILE_TABLE,
                IndexName: process.env.MAPPING_PROFILE_INDEX
            };

            docClient.query(_params, function(err, data){
                if (err){
                    callback(null, {
                        exists: false,
                        clientId: _clientId,
                        status: 'ERROR',
                        payload: _sourceObject,
                        errorMessage: err,
                        sourceId: event.sourceId
                    });
                } else {

                    if (data.Count > 0) {
                        var _item = data.Items;


                        callback(null, {
                            data: _item
                        });
                    } else {
                        callback(null, {
                            logId: event.logId,
                            exists: false,
                            clientId: _clientId,
                            payload: event.sourceObject,
                            stagingRecordId: event.stagingRecordId,
                            status: 'ERROR',
                            payload: process.env.MESSAGE_NO_PROFILE_EXISTS + '--> Type: ' + event.type,
                            sourceId: event.sourceId
                        });
                    }

                }
            });

        } else {

            callback(null, {
                logId: event.logId,
                exists: false,
                clientId: _clientId,
                status: 'ERROR',
                payload: _sourceObject,
                stagingRecordId: event.stagingRecordId,
                errorMessage: process.env.MESSAGE_BAD_PARAMETERS,
                sourceId: event.sourceId
            });
        }
    } catch (err) {
        callback(null, {
            logId: event.logId,
            exists: false,
            clientId: _clientId,
            status: 'ERROR',
            payload: _sourceObject,
            stagingRecordId: event.stagingRecordId,
            errorMessage: err,
            sourceId: event.sourceId
        });
    }

};

function isString (obj) {
    return (Object.prototype.toString.call(obj) === '[object String]');
}


