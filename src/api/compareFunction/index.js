const {
    firestore,
    realtime
} = require("../../../firebase");

var stringSimilarity = require('string-similarity');
const {
    v4: uuidv4
} = require('uuid');

module.exports = {
    in_fun: async (req, res) => {
        // let datafeild = await firestore.collection('admin-profiles').get();
        const {
            uid,
            plateCandidates,
            vid
        } = req.body;

        const getVehicle = await (await realtime.database().ref('vehicles').child(uid).child(vid).once('value')).val();
        const location = req.locat;
        const locationData = await (await realtime.database().ref('locations').child(location).once('value')).val();

        if (getVehicle == null) {
            return res.status(400).send("No such vehicle exist");
        }
        if (getVehicle.status !== "READY") {
            return res.status(400).send("Vehicle not ready");
        }
        const registerNo = getVehicle.regno;

        const allowedVeh = await (await realtime.database().ref('allowed_vehicles').child(location).child(uid).child(registerNo).once('value')).val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '-' + mm + '-' + yyyy;

        const allowedVisitedVeh = await (await realtime.database().ref('allowed_vehicles').child(location).child("visitors").child(today).child(uid).child(registerNo).once('value')).val();

        var updates = {};
        if (allowedVeh !== null) {
            var matches = stringSimilarity.findBestMatch(registerNo, plateCandidates);
            if (matches.bestMatch.rating < 0.8) {
                return res.status(400).send("Number Plate didn't matched");
            }
            var newKey = realtime.database().ref('logs').child(location).push().key;

            updates['/logs/' + location + '/' + newKey] = {
                'vregno': registerNo,
                'entryts': Date.now(),
                'status': 'ENTERED',
            };
            updates['/visits/' + uid + '/' + newKey] = {
                'date': today,
                'locID': location,
                'locName': locationData.name,
                'status': 'ENTERED',
                'entryts': Date.now(),
                'regno': registerNo
            };
            updates['/vehicles/' + uid + '/' + vid + '/status'] = "PENDING";
            updates['/vehicles/' + uid + '/' + vid + '/token'] = uuidv4();
            updates['/vehicles/' + uid + '/' + vid + '/amount'] = locationData.price;
            updates['/vehicles/' + uid + '/' + vid + '/locID'] = location;
            updates['/vehicles/' + uid + '/' + vid + '/locName'] = locationData.name;
            updates['/vehicles/' + uid + '/' + vid + '/logID'] = newKey;
        } else if (allowedVisitedVeh !== null) {
            var matches = stringSimilarity.findBestMatch(registerNo, plateCandidates);
            if (matches.bestMatch.rating < 0.8) {
                return res.status(400).send("Number Plate didn't matched");
            }
            var newKey = allowedVisitedVeh.visitKey;

            updates['/allowed_vehicles/' + location + '/visitors/' + today + '/' + uid + '/' + registerNo] = null;

            updates['/logs/' + location + '/' + newKey] = {
                'vregno': registerNo,
                'entryts': Date.now(),
                'status': 'ENTERED',
                'oneTimeVisit': true
            };

            updates['/visits/' + uid + '/' + newKey + '/status'] = 'ENTERED';
            updates['/visits/' + uid + '/' + newKey + '/entryts'] = Date.now();
            updates['/vehicles/' + uid + '/' + vid + '/status'] = "PENDING";
            updates['/vehicles/' + uid + '/' + vid + '/token'] = uuidv4();
            updates['/vehicles/' + uid + '/' + vid + '/amount'] = locationData.price;
            updates['/vehicles/' + uid + '/' + vid + '/locID'] = location;
            updates['/vehicles/' + uid + '/' + vid + '/locName'] = locationData.name;
            updates['/vehicles/' + uid + '/' + vid + '/logID'] = newKey;
        } else {
            return res.status(400).send("Vehicle not allowed");
        }
        realtime.database().ref().update(updates);

        return res.status(200).send({
            "UId": uid
        });
    },
    out_fun: async (req, res) => {
        const {
            uid,
            token,
            vid,
            enex
        } = req.body;
        if (enex !== "ex") {
            return res.status(400).send("This is not exit code");
        }
        const getVehicle = await (await realtime.database().ref('vehicles').child(uid).child(vid).once('value')).val();

        if (getVehicle === null) {
            return res.status(400).send("Vehicle Deleted");
        }
        const location = req.locat;

        if (getVehicle.status !== "ACCEPTED") {
            return res.status(400).send("Not Paid");
        }
        if (getVehicle.token !== token) {
            return res.status(400).send("Token Mismatch");
        }

        var updates = {};
        updates['/logs/' + location + '/' + getVehicle.logID + '/exitts'] = Date.now();
        updates['/logs/' + location + '/' + getVehicle.logID + '/status'] = "EXITED";
        updates['/vehicles/' + uid + '/' + vid + '/status'] = "READY";
        updates['/vehicles/' + uid + '/' + vid + '/token'] = null;
        updates['/vehicles/' + uid + '/' + vid + '/amount'] = null;
        updates['/vehicles/' + uid + '/' + vid + '/locID'] = null;
        updates['/vehicles/' + uid + '/' + vid + '/locName'] = null;
        updates['/vehicles/' + uid + '/' + vid + '/logID'] = null;

        updates['/visits/' + uid + '/' + getVehicle.logID + '/exitts'] = Date.now();
        updates['/visits/' + uid + '/' + getVehicle.logID + '/status'] = "EXITED";

        realtime.database().ref().update(updates);

        return res.status(200).send({
            "UId": uid
        });
    },
    in_simple: async (req, res) => {
        const {
            uid,
            vid
        } = req.body;

        const getVehicle = await (await realtime.database().ref('vehicles').child(uid).child(vid).once('value')).val();
        const location = req.locat;
        const locationData = await (await realtime.database().ref('locations').child(location).once('value')).val();

        if (getVehicle == null) {
            return res.status(400).send("No such vehicle exist");
        }
        if (getVehicle.status !== "READY") {
            return res.status(400).send("Vehicle not ready");
        }
        const registerNo = getVehicle.regno;

        const allowedVeh = await (await realtime.database().ref('allowed_vehicles').child(location).child(uid).child(registerNo).once('value')).val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '-' + mm + '-' + yyyy;

        const allowedVisitedVeh = await (await realtime.database().ref('allowed_vehicles').child(location).child("visitors").child(today).child(uid).child(registerNo).once('value')).val();

        var updates = {};
        if (allowedVeh !== null) {
            var newKey = realtime.database().ref('logs').child(location).push().key;

            updates['/logs/' + location + '/' + newKey] = {
                'vregno': registerNo,
                'entryts': Date.now(),
                'status': 'ENTERED',
            };
            updates['/visits/' + uid + '/' + newKey] = {
                'date': today,
                'locID': location,
                'locName': locationData.name,
                'status': 'ENTERED',
                'entryts': Date.now(),
                'regno': registerNo
            };
            updates['/vehicles/' + uid + '/' + vid + '/status'] = "PENDING";
            updates['/vehicles/' + uid + '/' + vid + '/token'] = uuidv4();
            updates['/vehicles/' + uid + '/' + vid + '/amount'] = locationData.price;
            updates['/vehicles/' + uid + '/' + vid + '/locID'] = location;
            updates['/vehicles/' + uid + '/' + vid + '/locName'] = locationData.name;
            updates['/vehicles/' + uid + '/' + vid + '/logID'] = newKey;
        } else if (allowedVisitedVeh !== null) {
            var newKey = allowedVisitedVeh.visitKey;

            updates['/allowed_vehicles/' + location + '/visitors/' + today + '/' + uid + '/' + registerNo] = null;

            updates['/logs/' + location + '/' + newKey] = {
                'vregno': registerNo,
                'entryts': Date.now(),
                'status': 'ENTERED',
                'oneTimeVisit': true
            };

            updates['/visits/' + uid + '/' + newKey + '/status'] = 'ENTERED';
            updates['/visits/' + uid + '/' + newKey + '/entryts'] = Date.now();
            updates['/vehicles/' + uid + '/' + vid + '/status'] = "PENDING";
            updates['/vehicles/' + uid + '/' + vid + '/token'] = uuidv4();
            updates['/vehicles/' + uid + '/' + vid + '/amount'] = locationData.price;
            updates['/vehicles/' + uid + '/' + vid + '/locID'] = location;
            updates['/vehicles/' + uid + '/' + vid + '/locName'] = locationData.name;
            updates['/vehicles/' + uid + '/' + vid + '/logID'] = newKey;
        } else {
            return res.status(400).send("Vehicle not allowed");
        }
        realtime.database().ref().update(updates);

        return res.status(200).send({
            "UId": uid
        });
    }
}