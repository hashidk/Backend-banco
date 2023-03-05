const bcrypt = require('bcrypt');

module.exports = class User {
  constructor(user){
    this.data = {
      email:    user.email,
      password: user.password || '',
      salt: user.salt || '',
      nickname: user.nickname
    }
  }

  encryptPassword(pass) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass, salt);

    this.data.password = hash
    this.data.salt = salt
  }

  comparePassword(pass){
    return bcrypt.compareSync(pass, this.data.password);
  }
}