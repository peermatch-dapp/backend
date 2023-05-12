import { NextFunction, Request, Response } from "express";
import { verifyJWTToken } from "./helpers";

export async function onlyAuthorized(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).json({ message: "authorization token not found" });
  }
  if (
    !(
      authorization.startsWith("Bearer") && authorization.split(" ").length == 2
    )
  ) {
    return res
      .status(400)
      .json({ message: "authorization token is in invalid format" });
  }
  const token = authorization.split(" ")[1];
  const decoded = verifyJWTToken(token) as {
    username: string;
  };
  if (!decoded) {
    return res.status(401).json({ message: "Invalid authorization token" });
  }

  // TODO: add the user object to the request object

  // const user = await prisma.user.findUnique({
  //   where: { address: decoded.username },
  // });
  // if (!user)
  //   return res.status(401).json({
  //     message: "The user associated to this authorization token not found",
  //   });
  // (req as CustomRequest).user = user;

  return next();
}
