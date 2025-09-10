import RoomDto from "../dtos/room-dto.js";
import roomService from "../services/room-service.js";
class RoomsController {
    async create(req, res) {
       // room
       const { topic, roomType } = req.body;
       if (!topic || !roomType) {
           return res.status(400).json({ message: 'Topic and room type are required.' });
       }

         const room = await roomService.create({
            topic,
            roomType,
            ownerId: req.user._id,
        });

        return res.status(201).json(new RoomDto(room));

    }

   async index(req, res) {
        const rooms = await roomService.getAllRooms(['open']);
        const allRooms = rooms.map((room) => new RoomDto(room));
        return res.json(allRooms);
    }

    async show(req, res) {
        const room = await roomService.getRoom(req.params.roomId);

        return res.json(room);
    }
}

export default new RoomsController();