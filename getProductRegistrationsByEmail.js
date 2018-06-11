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
                        var _item = data.Items[0],
                            _originalMappingProfile = null;

                        if (event.authorizationHeader !== undefined) {
                            _item.Headers = isString(_item.Headers) ?  JSON.parse(_item.Headers) : _item.Headers;
                            _item.Headers['Authorization'] = event.authorizationHeader ;
                        }

                        //if a mapping profile already exists, we copy to original mapping profile property because
                        //we can use it later for processing.  This use case is for when we get PUT mapping profiles and
                        //we need to get the
                        if (event.mappingProfile !== undefined) {
                            _originalMappingProfile = event.mappingProfile;
                        }

                        //we need to set mappingId if this is a PUT operation in order to get the data and structure
                        //coming back from destination. For example, if we are going to update Person data on Aura eStore
                        //then we first get the data by calling /Person/GetSingleById/#PersonId#, then we will remap object coming
                        //from client to this object and the update.


                        callback(null, {
                            logId: event.logId,
                            exists: true,
                            mappingProfile: _item,
                            mappingRulesExist: (_item.MappingRules !== undefined) ? true : false,
                            clientId: event.clientId,
                            destinationObject: (_item.Mappings !== undefined) ? _item.Mappings : null,
                            getPostMappingForInsert: event.getPostMappingForInsert,
                            clientRecordId: event.clientRecordId,
                            auraRecordId: event.auraRecordId,
                            authenticationRequired: _item.RequiresAuthentication,
                            stagingRecordId: event.stagingRecordId,
                            sourceObject: _sourceObject,
                            sourceId: event.sourceId,
                            newRecordId: event.newRecordId,
                            type:event.type,
                            saveType: event.saveType,
                            mappingId: event.mappingId,
                            orginalMappingProfile: _originalMappingProfile
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


