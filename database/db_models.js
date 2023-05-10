const sequelize = require('./db_config');
const {DataTypes} = require('sequelize')
const User = sequelize.define('user',{
    id:{type:DataTypes.INTEGER,primaryKey:true,unique:true,autoIncrement:true},
    chatId:{type: DataTypes.STRING},
    favorite:{type: DataTypes.STRING}
})

module.exports = User;