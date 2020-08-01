const {
    firestore,
    realtime
} = require("../../../firebase");

var stringSimilarity = require('string-similarity');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    fun: async (req, res) => {
        // let datafeild = await firestore.collection('admin-profiles').get();
        const { uid, plateCandidates, vid } = req.body;

        const getVehicle = await (await realtime.database().ref('vehicles').child(uid).child(vid).once('value')).val();
        const location = req.locat;
        const locationData = await (await realtime.database().ref('locations').child(location).once('value')).val();
        console.log(locationData);
        if (getVehicle == null) {
            return res.status(400).send("No such vehicle exist");
        }
        if (getVehicle.status !== "READY") {
            return res.status(400).send("Vehicle not ready");
        }
        const registerNo = getVehicle.regno;

        var matches = stringSimilarity.findBestMatch(registerNo, plateCandidates);
        if (matches.bestMatch.rating < 0.8) {
            return res.status(400).send("Number Plate didn't matched");
        }


        var updates = {};
        var newKey = realtime.database().ref('logs').child(location).push().key;

        updates['/logs/' + location + '/' + newKey] = {
            'vregno': registerNo,
            'entryts': Date.now(),
            'status': 'ENTERED',
        };
        updates['/vehicles/' + uid + '/' + vid + '/status'] = "PENDING";
        updates['/vehicles/' + uid + '/' + vid + '/token'] = uuidv4();
        updates['/vehicles/' + uid + '/' + vid + '/amount'] = locationData.price;
        updates['/vehicles/' + uid + '/' + vid + '/locID'] = location;
        updates['/vehicles/' + uid + '/' + vid + '/locName'] = locationData.name;
        updates['/vehicles/' + uid + '/' + vid + '/logID'] = newKey;

        realtime.database().ref().update(updates);

        return res.status(200).send({
            "UId": uid,
            "Plate Candidate": plateCandidates,
            "Match": matches
        });
    }
}

