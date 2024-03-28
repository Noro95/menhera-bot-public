import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, EmbedBuilder, Snowflake } from "discord.js";
import { Types } from "mongoose";
import { deleteWarning } from "../../database/functions/warningFunctions";

export default class DelWarnCommand extends BaseCommand {
	constructor() {
		super("delwarn", "moderation");
	}

	async run(client: DiscordClient, interaction: CommandInteraction) {
		const id = interaction.options.get("id", true).value as string;

		if (!Types.ObjectId.isValid(id)) {
			const embed = new EmbedBuilder()
				.setColor("RED")
				.setDescription("❌ Provided ID is incorrect");
			await interaction.followUp({ embeds: [embed] });
			return;
		}

		const mongooseID = new Types.ObjectId(id);
		const warning = await deleteWarning(mongooseID);

		if (!warning) {
			const embed = new EmbedBuilder()
				.setColor("RED")
				.setDescription("❗ Warning ID cannot be found");
			await interaction.followUp({ embeds: [embed] });
			return;
		}

		const user = await client.users.fetch(warning.userId as Snowflake);

		const channelEmbed = new EmbedBuilder()
			.setColor("GREEN")
			.setDescription(`✅ Deleted warning \`${id}\` for ${user.tag}`);
		await interaction.followUp({ embeds: [channelEmbed] });

		const logEmbed = new EmbedBuilder()
			.setAuthor({
				name: `Moderation | Deleted Warn | ${user.tag}`,
				iconURL: user.displayAvatarURL(),
			})
			.setDescription(
				`<@${interaction.user.id}> deleted a warning for \`${user.tag}\`. ID: \`${id}\``
			)
			.setTimestamp()
			.setFooter({ text: user.id });
		await client.logChannel.send({ embeds: [logEmbed] });
	}
}
