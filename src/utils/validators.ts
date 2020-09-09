import { body } from "express-validator";

export const registrationValidator = [
  body("email", "incorrect Email!").isEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters!")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .withMessage(
      "Password must contain at least 1 special char, must contain at least 1 uppercase char, must contain at least 1 lowercase char and only latin characters",
    )
    .trim(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body?.password) {
        throw new Error("Passwords must match!");
      }

      return true;
    })
    .trim(),
];

export const noticeValidator = [
  body("phoneNumber")
    .matches(/^[+7\s]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s/0-9]*$/)
    .withMessage("Invalid phone number!"),
  body("name", "'name' is Required field").isLength({ min: 1 }),
  body("category", "'category' is Required field").isLength({ min: 1 }),
  body("description", "'description' is Required field").isLength({ min: 1 }),
  body("price")
    .isLength({ min: 0 })
    .withMessage("You can select only positive numbers")
    .isLength({ max: 100000 })
    .withMessage("Max price is 100000"),
];

export const categoryValidator = [
  body("name", "'name' is required field")
    .isLength({ min: 1 }),
];
