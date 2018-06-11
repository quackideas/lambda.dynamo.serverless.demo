/**
 * Created by quannguyen on 6/11/18.
 */
/**
 * Created by auraconsultant on 11/27/17.
 */

// dependencies
var AWS = require('aws-sdk');
var util = require('util');
var uuidV4 = require('uuid/v4');

// Get reference to AWS clients
var dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

    var _returnObj = {},
        _id = uuidV4();

    if (event.clientId !== undefined && event.status !== undefined && event.sourceId !== undefined) {
        var _errorStatus,
            _errorMessage;

        if (event.postResponse !== undefined) {
            _errorStatus = (event.postResponse.statusCode !== 200) ? 'ERROR' : event.status,
                _errorMessage = (event.postResponse.statusCode !== 200) ? event.postResponse.statusCode + ' (RESPONSE BODY)' + event.postResponse.body: event.errorMessage;

        } else {
            _errorMessage = event.sourceObject;
            _errorStatus = event.status;
        }


        insertLog({
            id: _id,
            clientId: event.clientId,
            status: 'PROCESSING',
            //payload: event.payload,
            //errorMessage: _errorMessage,
            sourceId: event.sourceId,
            stagingRecordId: event.stagingRecordId,
            auraRecordId: event.auraRecordId,
            clientRecordId: event.clientRecordId//,
            //newRecordId: event.newRecordId
        }, function(err, data) {
            if (err !== null) {

                callback(null, {
                    sourceId: event.sourceId,
                    status: 'ERROR',
                    error: err
                });
            }

            callback(null, {
                logId: _id,
                clientId: event.clientId,
                type: event.type,
                directionTo: event.directionTo,
                errorCode: 0,
                status: 'SUCCESS',
                sourceId: event.sourceId,
                auraRecordId: event.auraRecordId,
                clientRecordId: event.clientRecordId
            });

        });
    } else {
        _returnObj.headers = {};
        _returnObj.statusCode = 400;
        _returnObj.body = 'ERROR';

        callback(null, _returnObj);
    }

};

function insertLog(params, fn) {
    var ms = (new Date).getTime();

    dynamodb.put({
        TableName: process.env.LOG_TABLE,
        Item: {
            "Id": params.id,
            "sourceId": params.sourceId,
            "clientId": params.clientId,
            "status": params.status,
            "errorMessage": (params.errorMessage !== '') ? params.errorMessage: 'no errors',
            "payload": params.payload,
            "stagingRecordId": params.stagingRecordId,
            "auraRecordId": params.auraRecordId,
            "clientRecordId": params.clientRecordId,
            "newRecordId": params.newRecordId,
            "dateCreated": Date(),
            "timeToLive": ms + 86400000
        }
    }, function(err, data) {
        return fn(err, data);
    });
}