import Notes from "../collections/notes";
import Storage from "../database/storage";
import FileStorage from "../database/fs";
import Notebooks from "../collections/notebooks";
import Trash from "../collections/trash";
import Tags from "../collections/tags";
import Sync from "./sync";
import Vault from "./vault";
import Lookup from "./lookup";
import Content from "../collections/content";
import Backup from "../database/backup";
import Conflicts from "./sync/conflicts";
import Session from "./session";
import Constants from "../utils/constants";
import { CHECK_IDS, EV, EVENTS, checkIsUserPremium } from "../common";
import Settings from "./settings";
import Migrations from "./migrations";
import Outbox from "./outbox";
import UserManager from "./user-manager";
import http from "../utils/http";
import Monographs from "./monographs";
import Offers from "./offers";
import Attachments from "../collections/attachments";
import Debug from "./debug";
import { Mutex } from "async-mutex";

/**
 * @type {EventSource}
 */
var NNEventSource;
class Database {
  /**
   *
   * @param {any} storage
   * @param {EventSource} eventsource
   */
  constructor(storage, eventsource, fs) {
    /**
     * @type {EventSource}
     */
    this.evtSource = null;
    this.sseMutex = new Mutex();

    this.storage = new Storage(storage);
    this.fs = new FileStorage(fs, storage);
    NNEventSource = eventsource;
  }

  async _validate() {
    if (!(await this.session.valid())) {
      throw new Error(
        "Your system clock is not setup correctly. Please adjust your date and time and then retry."
      );
    }
    await this.session.set();
  }

  async init() {
    EV.subscribeMulti(
      [EVENTS.userLoggedIn, EVENTS.userFetched, EVENTS.tokenRefreshed],
      this.connectSSE,
      this
    );
    EV.subscribe(EVENTS.attachmentDeleted, async (attachment) => {
      await this.fs.cancel(attachment.metadata.hash);
    });
    EV.subscribe(EVENTS.userLoggedOut, async () => {
      await this.monographs.deinit();
      this.syncer.stopAutoSync();
      this.disconnectSSE();
    });

    this.session = new Session(this.storage);
    await this._validate();

    this.user = new UserManager(this.storage);
    this.syncer = new Sync(this);
    this.vault = new Vault(this);
    this.conflicts = new Conflicts(this);
    this.lookup = new Lookup(this);
    this.backup = new Backup(this);
    this.settings = new Settings(this);
    this.migrations = new Migrations(this);
    this.outbox = new Outbox(this);
    this.monographs = new Monographs(this);
    this.offers = new Offers();
    this.debug = new Debug();

    // collections
    /** @type {Notes} */
    this.notes = await Notes.new(this, "notes", true, true);
    /** @type {Notebooks} */
    this.notebooks = await Notebooks.new(this, "notebooks");
    /** @type {Tags} */
    this.tags = await Tags.new(this, "tags");
    /** @type {Tags} */
    this.colors = await Tags.new(this, "colors");
    /** @type {Content} */
    this.content = await Content.new(this, "content", false);
    /** @type {Attachments} */
    this.attachments = await Attachments.new(this, "attachments");

    this.trash = new Trash(this);

    await this.trash.cleanup();
    await this.settings.init();
    await this.outbox.init();
    await this.user.init();

    await this.migrations.init();
    await this.migrations.migrate();

    this.monographs.init();
  }

  disconnectSSE() {
    if (!this.evtSource) return;
    this.evtSource.onopen = null;
    this.evtSource.onmessage = null;
    this.evtSource.onerror = null;
    this.evtSource.close();
    this.evtSource = null;
  }

  async connectSSE(args) {
    await this.sseMutex.runExclusive(async () => {
      if (args && !!args.error) return;

      if (!NNEventSource) return;
      this.disconnectSSE();

      let token = await this.user.tokenManager.getAccessToken();
      this.evtSource = new NNEventSource(`${Constants.SSE_HOST}/sse`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.evtSource.onopen = async () => {
        console.log("SSE: opened channel successfully!");
      };

      this.evtSource.onerror = function (error) {
        console.log("SSE: error:", error);
      };

      this.evtSource.onmessage = async (event) => {
        try {
          var { type, data } = JSON.parse(event.data);
          data = JSON.parse(data);
          // console.log(type, data);
        } catch (e) {
          console.log("SSE: Unsupported message. Message = ", event.data);
          return;
        }

        switch (type) {
          case "upgrade":
            const user = await this.user.getUser();
            user.subscription = data;
            await this.user.setUser(user);
            EV.publish(EVENTS.userSubscriptionUpdated, data);
            break;
          case "userDeleted":
            await this.user.logout(false, "Account Deleted");
            break;
          case "userPasswordChanged":
            await this.user.logout(true, "Password Changed");
            break;
          case "emailConfirmed":
            const token = await this.storage.read("token");
            await this.user.tokenManager._refreshToken(token);
            await this.user.fetchUser(true);
            EV.publish(EVENTS.userEmailConfirmed);
            break;
          case "sync":
            if (!(await checkIsUserPremium(CHECK_IDS.databaseSync))) break;

            await this.syncer.remoteSync(data);
            break;
        }
      };
    });
  }

  async lastSynced() {
    return this.storage.read("lastSynced");
  }

  sync(full = true, force = false) {
    return this.syncer.start(full, force);
  }

  /**
   *
   * @param {{AUTH_HOST: string, API_HOST: string, SSE_HOST: string, SUBSCRIPTIONS_HOST: string}} hosts
   */
  host(hosts) {
    if (process.env.NODE_ENV !== "production") {
      Constants.AUTH_HOST = hosts.AUTH_HOST || Constants.AUTH_HOST;
      Constants.API_HOST = hosts.API_HOST || Constants.API_HOST;
      Constants.SSE_HOST = hosts.SSE_HOST || Constants.SSE_HOST;
      Constants.SUBSCRIPTIONS_HOST =
        hosts.SUBSCRIPTIONS_HOST || Constants.SUBSCRIPTIONS_HOST;
    }
  }

  version() {
    return http.get(`${Constants.API_HOST}/version`);
  }

  async announcements() {
    let url = `${Constants.API_HOST}/announcements/active`;
    const user = await this.user.getUser();
    if (user) url += `?userId=${user.id}`;
    return http.get(url);
  }
}

export default Database;
