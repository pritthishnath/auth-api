/**
 * @desc shared types
 */

import { Types } from "mongoose";

export type TTokenData = {
  userId: Types.ObjectId;
  username: string;
};
