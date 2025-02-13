import vine from "@vinejs/vine";

// {
//   sub: 'd93e1772-4916-4243-850f-a6d9b2615716',
//   email_verified: true,
//   gender: 'prefer_not_to_say',
//   name: 'Test User',
//   favourite_pet: 'cat',
//   preferred_username: 'testuser',
//   locale: 'pl',
//   given_name: 'Test',
//   family_name: 'User',
//   email: 'testuser@gmail.com'
// }
export const userSchema = vine.compile(
  vine.object({
    sub: vine.string(),
    email_verified: vine.boolean(),
    gender: vine.string(),
    name: vine.string(),
    favourite_pet: vine.string(),
    preferred_username: vine.string(),
    locale: vine.string(),
    given_name: vine.string().nullable(),
    family_name: vine.string(),
    email: vine.string(),
  }),
);
