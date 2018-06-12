/**
 * Created by quannguyen on 6/11/18.
 */
/**
 * Created by auraconsultant on 11/27/17.
 */

// dependencies
var AWS = require('aws-sdk');
var uuidV4 = require('uuid/v4');

// Get reference to AWS clients
var dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

    var _returnObj = {},
        _id = uuidV4();

    if (event.firstName !== undefined && event.lastName !== undefined && event.email !== undefined) {

        insertRegistration({
            id: _id,
            firstName: event.firstName,
            lastName: event.lastName,
            email: event.email,
            serialNumbers: event.serialNumbers
        }, function(err, data) {
            if (err !== null) {

                _returnObj.headers = {};
                _returnObj.statusCode = 400;
                _returnObj.body = 'ERROR - Fail to Insert';
                
                console.log(err);
                console.log(data);

                callback(null, _returnObj);
            }

            _returnObj.headers = {};
            _returnObj.statusCode = 200;
            _returnObj.body = 'SUCCESS';

            callback(null, _returnObj);

        });
    } else {
        _returnObj.headers = {};
        _returnObj.statusCode = 400;
        _returnObj.body = 'ERROR - Missing parameters';

        callback(null, _returnObj);
    }

};

function insertRegistration(params, fn) {

    dynamodb.put({
        TableName: 'BWProductRegistration',
        Item: {
            "id": params.id,
            "firstName": params.firstName,
            "lastName": params.lastName,
            "email": params.email,
            "serialNumbers": params.serialNumbers,
            "dateCreated": Date()
        }
    }, function(err, data) {
        return fn(err, data);
    });
}