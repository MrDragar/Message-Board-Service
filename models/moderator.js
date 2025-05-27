import Advertisement from "./advertisement.js";
import User from "./user.js";


class Moderator {
    static async premoderateAd (isAccepted,  adId) {
        const advertisement = await Advertisement.findByPk(adId);
        if (advertisement === null) {
            return 1;
        }
        if (advertisement.status !== "in_moderation") 
            return 1;
        if (isAccepted)
            advertisement.status = "published";
        else 
            advertisement.status = "rejected";
        await advertisement.save();
        return 0;
    }

    static async deleteAd(adId) {
        const advertisement = await Advertisement.findByPk(adId);
        if (advertisement === null) {
            return 1;
        }
        advertisement.status = "deleted";
        await advertisement.save();
    }

    static async banUser(userId) {
        const user = await User.findByPk(userId);
        if (user === null) 
            return 1;
        if (user.status !== "user") 
            return 1;
        user.isBanned =  true;
        await user.save();
    }
};

export default Moderator;