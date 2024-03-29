// Database
import Database from "../../classes/Database_Llck_db";
import mongoose, { Schema } from "mongoose";

// Logger
import Logger from "../../classes/Logger";

// Factom
import Properties from "../../properties";
import Factom from "factom-harmony-connect";
import Errors from "../../classes/Errors";

const factomConnectSDK = new Factom(Properties.factom.config);

const generatedModel = {
  /**
   * Init  schema
   */
  init() {
    const db = Database.getConnection();

    /**
     * Classes
     */
    const classesSchema = new mongoose.Schema({
      entry_hash: {
        type: "String",
        required: true
      },
      chain_id: {
        type: "String",
        required: true
      },
      content: {
        type: "String",
        required: true
      },

      // RELATIONS
      identity: {
        type: Schema.ObjectId,
        ref: "Identity"
      }

      // EXTERNAL RELATIONS
      /*
      chain_id: {
        type: Schema.ObjectId,
        ref : "Chain"
      },
      */
    });

    generatedModel.setModel(db.connection.model("Chains", classesSchema));

    return classesSchema;
  },

  /**
   * Set Model
   */
  setModel: model => {
    generatedModel.model = model;
  },

  /**
   * Get model
   */
  getModel: () => {
    return generatedModel.model;
  },

  // Start queries

  // CRUD METHODS

  /**
   * ChainModel.create
   *   @description CRUD ACTION create
   *
   */
  async create(signerPrivateKey, signerChainId, content, entryHash, identity) {
    try {
      if (!signerPrivateKey) {
        // Chain Management
        let result = new generatedModel.model({
          chain_id: signerChainId,
          entry_hash: entryHash,
          content: content,
          identity: identity
        });
        return await result.save();
      } else {
        // Chain Audit
        const { chain_id, entry_hash } = await factomConnectSDK.chains.create({
          signerPrivateKey,
          signerChainId,
          content
        });

        let result = new generatedModel.model({
          chain_id: chain_id,
          entry_hash: entry_hash,
          content: content,
          identity: identity
        });
        return await result.save();
      }
    } catch (e) {
      if (e.response.status === 403) {
        throw new Errors.INVALID_AUTH_FACTOM();
      } else if (e.response.status === 429) {
        throw new Errors.EXCEDEED_LIMIT_REQUEST();
      }
    }
  },

  /**
   * ChainModel.list
   *   @description CRUD ACTION list
   *
   */
  async list() {
    return await generatedModel.model.find();
  }
};

export default generatedModel;
