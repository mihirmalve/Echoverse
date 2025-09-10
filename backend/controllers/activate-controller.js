import sharp from 'sharp';
import path from 'path';
import userService from '../services/user-service.js';
import UserDto from '../dtos/user-dto.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body;

        if (!name || !avatar) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Extract base64 data safely
        const matches = avatar.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ message: "Invalid image data" });
        }

        const ext = matches[1]; // extension (jpeg/png etc.)
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const imageName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`; // save as .jpeg
        const imagePath = path.resolve(__dirname, `../storage/${imageName}`);

        try {
            // Resize and compress using sharp
            await sharp(buffer)
                .resize(150, 150)
                .jpeg({ quality: 70 }) // compress with 70% quality
                .toFile(imagePath);
        } catch (error) {
            console.error("SHARP ERROR:", error);
            return res.status(500).json({ message: "Could not process the image" });
        }

        // update user
        const userId = req.user._id;
        try {
            const user = await userService.findUser({ _id: userId });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imageName}`;
            await user.save();

            return res.json({ user: new UserDto(user), auth: true });
        } catch (error) {
            console.error("User Update Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new ActivateController();
