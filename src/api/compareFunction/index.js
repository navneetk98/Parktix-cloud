const {
    firestore,
    realtime
  } = require("../../../firebase");

  var stringSimilarity = require('string-similarity');

module.exports = {
    fun: async (req, res) => {
        // let datafeild = await firestore.collection('admin-profiles').get();
        const { uid, plateCandidates ,vid} = req.body;
        const getVehicle=await (await realtime.database().ref('vehicles').child(uid).child(vid).once('value')).val();
        
        if(getVehicle==null){
            res.status(400).send("No such vehicle exist");
        }
        if(getVehicle.status!=="READY")
        {
            res.status(400).send("Vehicle not ready");
        }
        const registerNo= getVehicle.regno.split(" ").join("");
        console.log(registerNo);
        var matches = stringSimilarity.findBestMatch(registerNo, plateCandidates);
        console.log(matches);
        res.status(200).send({
            "UId" : uid,
            "Plate Candidate" : plateCandidates
        });
    }
}

