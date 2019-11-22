// Import Sequelize
import Sequelize from "sequelize";
import InitSchema from "../models/schema_llck_db";
import UserModel from "../models/Llck_db/UserModel";

// Logging
import Logger from "./Logger";
// Properties
import properties from "../properties.js";

class Database {
  constructor() {}

  /**
   * Init database
   */
  async init() {
    await this.authenticate();
    Logger.info(
      "Database connected at: " +
        properties.llck_db.host +
        ":" +
        properties.llck_db.port +
        "//" +
        properties.llck_db.user +
        "@" +
        properties.llck_db.name
    );

    // Import schema
    InitSchema();

    await UserModel.createAdminUser();

  }

  /**
   * Start database connection
   */
  async authenticate() {
    Logger.info("Authenticating to the databases...");

    const sequelize = new Sequelize(
      properties.llck_db.name,
      properties.llck_db.user,
      properties.llck_db.password,
      {
        host: properties.llck_db.host,
        dialect: properties.llck_db.dialect,
        port: properties.llck_db.port,
        logging: false
      }
    );
    this.dbConnection_llck_db = sequelize;

    try {
      await sequelize.sync();
    } catch (err) {
      // Catch error here
      Logger.error(`Failed connection to the DB`);
      Logger.error(err);
      await new Promise(resolve => setTimeout(resolve, 5000));
      await this.authenticate();
    }
  }

  /**
   * Get connection db
   */
  getConnection() {
    return this.dbConnection_llck_db;
  }
}

export default new Database();
