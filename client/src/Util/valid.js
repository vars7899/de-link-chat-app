export const valid = (name, email, password, cf_password) => {
  // 1. if any field is empty --> return error
  if (!name || !email || !password || !cf_password) {
    return "Please enter all the required fields";
  }
  // 2. verify if the email is valid --> return error
  if (!validateEmail(email)) return "Invalid email";
  // 3. verify if the password length is greater than 8 character
  if (password.length < 8) return "Password must have at least 8 character";
  // 4. verify if password is equal to cf_password
  if (password !== cf_password) return "Password do not match";
};

export const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
