const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "update",
    version: "2.0.0",
    hasPermission: 2,
    credits: "Custom Updater",
    description: "Bot update system",
    commandCategory: "system",
    usages: "[check/now/status]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    
    // Admin check
    const configPath = path.join(__dirname, '..', 'config.json');
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        return api.sendMessage("❌ Config file nahi mili!", threadID, messageID);
    }
    
    const adminList = config.ADMINBOT || [];
    if (!adminList.includes(senderID)) {
        return api.sendMessage("❌ Sirf admin update kar sakta hai!", threadID, messageID);
    }

    const cmd = args[0]?.toLowerCase();

    // Updater config check
    const updaterPath = path.join(__dirname, '..', 'updater.json');
    let updaterConfig;
    try {
        updaterConfig = JSON.parse(fs.readFileSync(updaterPath, 'utf8'));
    } catch (e) {
        return api.sendMessage("❌ updater.json nahi mila! Root folder mein updater.json banao.", threadID, messageID);
    }

    if (cmd === "check") {
        api.sendMessage("🔍 GitHub se update check ho raha hai...", threadID, (err, info) => {
            exec('git fetch && git status', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                    return api.sendMessage(`❌ Git error: ${error.message}`, threadID);
                }
                
                if (stdout.includes('Your branch is behind')) {
                    const match = stdout.match(/by (\d+) commit/);
                    const count = match ? match[1] : 'kuch';
                    api.sendMessage(`🔄 Naya update available hai! ${count} commits behind.\nUse: .update now`, threadID);
                } else if (stdout.includes('up to date')) {
                    api.sendMessage(`✅ Bot up-to-date hai!`, threadID);
                } else {
                    api.sendMessage(`ℹ️ ${stdout}`, threadID);
                }
            });
        });
    } 
    else if (cmd === "now") {
        api.sendMessage("⏳ Bot update start ho raha hai...\n⚠️ Backup banaya ja raha hai...", threadID, (err, info) => {
            
            // Backup folder create
            const backupDir = path.join(__dirname, '..', 'backups', `backup_${Date.now()}`);
            fs.mkdirSync(backupDir, { recursive: true });
            
            // Backup important files
            const filesToBackup = ['config.json', 'appstate.json'];
            filesToBackup.forEach(file => {
                const source = path.join(__dirname, '..', file);
                if (fs.existsSync(source)) {
                    fs.copyFileSync(source, path.join(backupDir, file));
                }
            });
            
            api.sendMessage("✅ Backup complete! Ab update ho raha hai...", threadID);
            
            // Git pull
            exec('git pull origin main', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                if (error) {
                    return api.sendMessage(`❌ Update failed: ${error.message}\nBackup folder: ${backupDir}`, threadID);
                }
                
                // Restore configs
                try {
                    filesToBackup.forEach(file => {
                        const backupFile = path.join(backupDir, file);
                        const targetFile = path.join(__dirname, '..', file);
                        if (fs.existsSync(backupFile)) {
                            fs.copyFileSync(backupFile, targetFile);
                        }
                    });
                } catch (e) {
                    console.log("Config restore error:", e);
                }
                
                api.sendMessage(`✅ Update complete!\n\n⚠️ 5 seconds mein bot restart hoga...`, threadID);
                
                setTimeout(() => {
                    process.exit(1);
                }, 5000);
            });
        });
    }
    else if (cmd === "status") {
        exec('git log -1 --pretty=format:"%h - %s (%cr)"', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
            let statusMsg = `📊 Bot Status:\n`;
            statusMsg += `🔧 Last commit: ${stdout || 'unknown'}\n`;
            statusMsg += `📁 Backups: /backups folder mein`;
            api.sendMessage(statusMsg, threadID);
        });
    }
    else {
        api.sendMessage("Usage:\n.update check - Check for updates\n.update now - Install updates\n.update status - Bot status", threadID, messageID);
    }
};