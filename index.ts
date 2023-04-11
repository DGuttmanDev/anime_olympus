const {Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const config = require('./config.json');
const schedule = require('node-schedule');
const animesJSON = require('./animes.json');

const client = new Client({intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers]});

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

const jobs: any[] = [];

// Funcion que se ejecuta todos los dias a las 12pm para actualizar la lista de animes
const actualizacion = schedule.scheduleJob({
    hour: 12,
    minute: 0
}, function () {

    if (jobs.length > 1) {

        console.log(`Emisiones a borrar: ${jobs.length}.`)
        jobs.forEach(job => {
            job.cancel;
            console.log(job + " cancelado");
        })

        jobs.length = 0;

        console.log(`Emisiones restantes en arreglo: ${jobs.length}.`)

    } else {
        console.log(`No hay emisiones programadas, no se borrará ninguna.`)
    }

    // Obtenemos todos los animes del archivo json y se guardan en arreglo
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

    // Creamos un arreglo vacio que contendra los animes del dia actual y tambien obtenemos el dia de la semana actual
    const animesHoy: Anime[] = [];
    const fechaActual = new Date();
    const diaSemanaActual = fechaActual.getDay();

    animes.forEach(anime => {

        if (diaSemanaActual == anime.emision_semanal.dia_semana) {
            animesHoy.push(anime);
        }

    });

    if (animesHoy.length > 0) {

        animesHoy.forEach(anime => {

            console.log(`${anime.nombre} agregado a la lista de emisiones.`)

            // Funcion que se ejecuta a la hora determinada para anunciar el anime
            let emision = schedule.scheduleJob({
                hour: anime.emision_semanal.hora,
                minute: anime.emision_semanal.minuto
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
                console.log(`${anime.nombre} emitido.`)
            });

            jobs.push(emision)

        })

    }

});

actualizacion.invoke();

client.on('ready', () => {
    console.log("Bot online");
})

client.login(config.bot_token);