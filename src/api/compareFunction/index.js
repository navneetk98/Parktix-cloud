const {
    firestore,
  } = require("../../../firebase");

module.exports = {
    fun: async (req, res) => {
        let datafeild = await firestore.collection('admin-profiles').get();
        res.send({
            "hello" : "hello",
            "data" : datafeild
        });
    }
}

