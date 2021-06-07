const Discord = require('discord.js');
const fs = require('fs');
const config = require('config');
const client = new Discord.Client();
const disbut = require('discord.js-buttons')(client);

const readfile = () => {
    try {
        return fs.readdirSync('./files/', { withFileTypes: true }, (err, files) => {
            if (err) console.error(err);
            return files.filter((now) => now.isFile());
        }).map((now) => now.name);
    } catch (error) {
        console.error('この実行ファイルと同じディレクトリにfilesフォルダがありません。');
        return [];
    }
};
const voiceChanelJoin = async (channelId) => {
    await channelId.join()
        .catch((err) => {
            console.log(err);
            return false;
        });
    return true;
};
const discordLogin = async () => {
    console.log('Discord　Botログイン処理を実行');
    await client.login(config.get('Api.discordToken'));
    console.log('Discord　Botログイン処理を完了');
};
const onErrorListen = (error) => {
    client.destroy();
    console.error(error.name);
    console.error(error.message);
    console.error(error.code);
    console.error(error);
    console.error('予期せぬエラーのためBotプログラムは終了しました。');
    process.exit(1);
};
const fileupdateButton = new disbut.MessageButton()
    .setStyle('green')
    .setLabel('ファイル更新・読込')
    .setID('scan');
const listButton = new disbut.MessageButton()
    .setStyle('green')
    .setLabel('再生可能ファイル一覧を表示')
    .setID('list');
const killwButton = new disbut.MessageButton()
    .setStyle('red')
    .setLabel('ボイスチャンネルから切断する')
    .setID('killw');
const createButtns = (files) => {
    const buttons = [];
    for (const x in files) {
        buttons.push(new disbut.MessageButton()
            .setStyle('blurple')
            .setLabel(`${files[x]}を再生`)
            .setID(files[x]));
    }
    buttons.push(fileupdateButton);
    return buttons;
};
const sliceByNumber = (array, number) => {
    const length = Math.ceil(array.length / number);
    return new Array(length).fill().map((_, i) =>
        array.slice(i * number, (i + 1) * number)
    );
};

process.on('uncaughtException', onErrorListen);
process.on('unhandledRejection', onErrorListen);


let fileList = readfile();
let btn = createButtns(fileList);
discordLogin();

client.on('ready', () => {
    console.log('Bot準備完了');
});

client.on('message', async (message) => {
    const guild = message.guild;
    const botUserVoiceConnection = guild.member(client.user).voice.connection;

    if (message.content === '/joinw') {
        if (message.member.voice.channel) {
            if (!botUserVoiceConnection || (botUserVoiceConnection && botUserVoiceConnection.status === 4)) {
                if (await voiceChanelJoin(message.member.voice.channel)) {
                    console.log('ボイスチャンネルへ接続しました。');
                    message.channel.send('ボイスチャンネルへ接続しました。切断は「/killw」です。', { code: true, buttons: [listButton, killwButton] });
                }
            } else {
                message.reply('既にボイスチャンネルへ接続済みです。', { buttons: [killwButton] });
            }
        } else {
            message.reply('まずあなたがボイスチャンネルへ接続している必要があります。');
        }
    } else if (message.content === '/killw') {
        if (botUserVoiceConnection && botUserVoiceConnection.status !== 4) {
            botUserVoiceConnection.disconnect();
            message.channel.send(':dash:');
        } else {
            message.reply('Botはボイスチャンネルに接続していないようです。');
        }
    } else if (message.content === '/list') {
        message.reply('再生可能ファイル一覧');
        const btnsp = sliceByNumber(btn, 5);
        for (const x in btnsp) {
            message.reply('', { buttons: btnsp[x] });
        }
    } else if (message.content === '/scan') {
        fileList = readfile();
        btn = createButtns(fileList);
    } else if (fileList.map((now) => `/${now}`).includes(message.content)) {
        if (botUserVoiceConnection && botUserVoiceConnection.status !== 4) {
            const src = fs.createReadStream(`./files/${message.content}`);
            botUserVoiceConnection.play(src);
        }
    }
});

client.on('clickButton', async (button) => {
    const guild = button.guild;
    const member = guild.member(button.clicker.user);
    const botUserVoiceConnection = guild.member(client.user).voice.connection;

    await button.think();
    if (fileList.includes(button.id)) {
        if (botUserVoiceConnection && botUserVoiceConnection.status !== 4) {
            const src = fs.createReadStream(`./files/${button.id}`).on('error', (err) => {
                console.error(err);
                button.message.channel.send('ファイルが見つからないため再生できませんでした。', { buttons: [fileupdateButton] });
            });
            await botUserVoiceConnection.play(src);
            button.reply.delete();
        } else {
            const joinbtn = new disbut.MessageButton()
                .setStyle('green')
                .setLabel('ボイスチャンネルに呼び出す')
                .setID('join');
            button.reply.edit('Botはボイスチャンネルに接続していないようです。\nボイスチャンネルに呼び出してください。', { buttons: [joinbtn] });
        }
    } else if (button.id === 'join') {
        if (member && member.voice.channel && (!botUserVoiceConnection || (botUserVoiceConnection && botUserVoiceConnection.status === 4)) && await voiceChanelJoin(member.voice.channel)) {
            console.log('ボイスチャンネルへ接続しました。');
            button.reply.edit('ボイスチャンネルへ接続しました。', { code: true, buttons: [listButton, killwButton] });
        } else {
            button.reply.edit('ボイスチャンネルへ接続できませんでした。\n自分がボイスチャンネルに入っていないか、既に接続されています。', { code: true });
        }
    } else if (button.id === 'scan') {
        fileList = readfile();
        if (fileList.length > 0) {
            btn = createButtns(fileList);
            button.reply.edit('ファイル更新・読込に成功しました。', { code: true, buttons: [listButton] });
        } else {
            button.reply.edit('ファイル更新・読込に失敗しました。', { code: true });
        }
    } else if (button.id === 'list') {
        button.reply.delete();
        const btnsp = sliceByNumber(btn, 5);
        for (const x in btnsp) {
            button.message.channel.send(x, { buttons: btnsp[x] });
        }
    } else if (button.id === 'killw') {
        if (botUserVoiceConnection && botUserVoiceConnection.status !== 4) {
            botUserVoiceConnection.disconnect();
            button.reply.edit(':dash:');
        } else {
            button.reply.edit('Botはボイスチャンネルに接続していないようです。');
        }
    } else {
        button.reply.edit('ファイルが見つからないため再生できませんでした。', { buttons: [fileupdateButton] });
    }
});