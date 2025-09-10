import RoomModel from '../models/room-model.js';
// This service handles room-related operations such as creating a room.

class RooomService {
  async create(payload){
     const { topic, roomType, ownerId } = payload;
     const room = await RoomModel.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId],
        });
        return room;
  }

  async getAllRooms(types) {
        const rooms = await RoomModel.find({ roomType: { $in: types } })
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return rooms;
    }
    async getRoom(roomId) {
        const room = await RoomModel.findOne({ _id: roomId });
        return room;
    }
}
export default new RooomService();