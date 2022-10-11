import mongoose from 'mongoose';

export const query = (roomId?, isEnabledValue?, hotelId?) => {
  roomId = roomId ? new mongoose.Types.ObjectId(roomId) : { $exists: true };
  hotelId = hotelId ? new mongoose.Types.ObjectId(hotelId) : { $exists: true };
  isEnabledValue = !isEnabledValue || isEnabledValue === 'true' ? true : false;

  return [
    {
      $match: {
        _id: roomId,
        isEnabled: isEnabledValue,
        hotel: hotelId,
      },
    },
    {
      $lookup: {
        from: 'hotels',
        localField: 'hotel',
        foreignField: '_id',
        as: 'hotel',
      },
    },
    {
      $unwind: '$hotel',
    },
    {
      $addFields: {
        id: '$_id',
        hotel: { id: '$hotel._id' },
      },
    },

    {
      $project: {
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
        hotel: { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 },
      },
    },
  ];
};
// { $sort: { createdAt: -1 } },
