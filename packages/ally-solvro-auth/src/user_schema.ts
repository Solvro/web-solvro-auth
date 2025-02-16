import vine from "@vinejs/vine";

export const userSchema = vine.compile(
  vine.object({
    sub: vine.string(),
    email_verified: vine.boolean(),
    name: vine.string().optional(),
    preferred_username: vine.string(),
    email: vine.string(),
  }),
);
