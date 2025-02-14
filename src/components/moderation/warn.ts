import * as Discord from "discord.js";

import { strict as assert } from "assert";

import { M, critical_error, unwrap } from "../../utils.js";
import { Wheatley } from "../../wheatley.js";
import { TextBasedCommand, TextBasedCommandBuilder } from "../../command.js";
import { ModerationComponent, basic_moderation, moderation_entry, moderation_type } from "./moderation-common.js";

import * as mongo from "mongodb";

/**
 * Implements !warn
 */
export default class Warn extends ModerationComponent {
    get type(): moderation_type {
        return "warn";
    }

    constructor(wheatley: Wheatley) {
        super(wheatley);

        this.add_command(
            new TextBasedCommandBuilder("wwarn")
                .set_permissions(Discord.PermissionFlagsBits.BanMembers)
                .set_description("wwarn")
                .add_user_option({
                    title: "user",
                    description: "User to warn",
                    required: true,
                })
                .add_string_option({
                    title: "reason",
                    description: "Reason",
                    required: true,
                })
                .set_handler(this.warn_handler.bind(this)),
        );
    }

    async apply_moderation(entry: moderation_entry) {
        // nop
    }

    async remove_moderation(entry: mongo.WithId<moderation_entry>) {
        assert(false);
    }

    is_moderation_applied(moderation: basic_moderation): never {
        assert(false);
    }

    async warn_handler(command: TextBasedCommand, user: Discord.User, reason: string) {
        try {
            const moderation: moderation_entry = {
                case_number: -1,
                user: user.id,
                user_name: user.displayName,
                moderator: command.user.id,
                moderator_name: (await command.get_member()).displayName,
                type: "warn",
                reason,
                issued_at: Date.now(),
                duration: null,
                active: true,
                removed: null,
                expunged: null,
            };
            await this.register_new_moderation(moderation);
            await this.reply_and_notify(command, user, "warned", moderation);
        } catch (e) {
            await this.reply_with_error(command, "Error warning");
            critical_error(e);
        }
    }
}
