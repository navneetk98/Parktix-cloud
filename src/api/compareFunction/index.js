const {
    firestore,
  } = require("./../../firebase");

module.exports = {
    fun: async (req, res) => {
        res.send({
            "hello" : "hello"
        });
    }
}

