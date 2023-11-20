import jwt from "jsonwebtoken";

export function generateToken(data: object, type?: string): string | string[] {
  switch (type) {
    case "access":
      return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m",
      });

    case "refresh":
      return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "10d",
      });

    default:
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m",
      });

      const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "10d",
      });

      return [accessToken, refreshToken];
  }
}
