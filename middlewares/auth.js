const admin = require('../firerbase/index');
const User = require('../models/user')

exports.authCheck = async (req, res, next) => {
    // console.log(req.headers.authtoken);
    try{
        const firebaseUser = await admin
        .auth()
        .verifyIdToken(req.headers.authtoken);
        // console.log("FIREBASE USER IS AUTHENTICATED", firebaseUser);
        req.user = firebaseUser;
        next();
    }catch (err) {
        console.log("ERROR", err);
        res.status(401).json({
            err: "Invalid or expired token.",
        });
    }
};

exports.adminCheck = async (req, res, next) => {
    const {email} = req.user;

    const adminUser = await User.findOne({email}).exec();

    if(adminUser.role !== 'admin'){
        res.status(403).json({
            err: 'Admin resource: access denied!',
        });
    }else {
        next();
    }
};