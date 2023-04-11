const {Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const client = new Client({intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers]});
const config = require('./config.json');
const schedule = require('node-schedule');
const animesJSON = require('./animes.json');

interface Anime {
    nombre: string;
    descripcion: string;
    thumbnail: string;
    url: {
        animeflv: string
    }
    emision_semanal: {
        dia_semana: number;
        hora: number;
        minuto: number;
    };
}

const animes: Anime[] = animesJSON.map((animeJSON: any) => ({
    nombre: animeJSON.nombre,
    descripcion: animeJSON.descripcion,
    thumbnail: animeJSON.thumbnail,
    url: {
        animeflv: animeJSON.url.animeflv
    },
    emision_semanal: {
        dia_semana: animeJSON.emision_semanal.dia_semana,
        hora: animeJSON.emision_semanal.hora,
        minuto: animeJSON.emision_semanal.minuto
    }
}));


animes.forEach(anime => {
    schedule.scheduleJob({
        hour: anime.emision_semanal.hora,
        minute: anime.emision_semanal.minuto,
        dayOfWeek: anime.emision_semanal.dia_semana
    }, function () {
        const botChannel = client.channels.cache.get(config.bot_channel_id)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Animeflv')
                    .setStyle('Link')
                    .setURL(anime.url.animeflv),
            );

        const embed = new EmbedBuilder()
            .setTitle(`[EMISION] ${anime.nombre}`)
            .setDescription(anime.descripcion)
            .setThumbnail(anime.thumbnail)

        botChannel.send({embeds: [embed], components: [row]});
    });
});

client.on('ready', () => {
    console.log("Bot online");
})

client.login(config.bot_token);