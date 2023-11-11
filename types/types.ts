/**
 * @desc shared types
 */

import { Types } from "mongoose";

export type TokenDataType = {
  userId: Types.ObjectId;
  username: string;
};
