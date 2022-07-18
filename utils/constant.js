var _ = require('underscore');
module.exports = function() {

    var constants = {
        baseApiUrl : '/v1/',
        PORT: 3000,
        HttpProvider: 'http://127.0.0.1:7545',
        WebSocketProvider: 'ws://localhost:8546',
        BUSINESS_TYPES: {
            motor: {
                NewCar: "New Car",//BRAND NEW CAR
                RenewalBreakIn: "Renewal Break In" //should be RolloverBreakin
            }
        },
        MOTOR_BUSINESS_TYPES: {
            fw: {
                NEW_CAR: "NewCar",
                RENEWAL_BREAK_IN: "RenewalBreakIn"
            }
        },
        RENEWAL_INSURERS: [
            '1', '3', '5'
        ]
    };
  var envConstants = {};
    return _.extend(constants, envConstants);
};
