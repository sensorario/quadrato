#!/usr/bin/env node
// generate-changelog.js
// Script Node.js per generare un CHANGELOG.md completo dai commit git

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

function getGitLogByTag() {
    // Ottieni i log raggruppati per tag (release)
    // Usa git tag per trovare le release, poi git log per ogni intervallo
    const tags = execSync('git tag --sort=-creatordate', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);
    let changelog = '';
    // Funzione per categorizzare i commit
    function categorizeCommits(logLines) {
        const features = [];
        const fixes = [];
        const others = [];
        for (const line of logLines) {
            const match = line.match(/^(\w+) (\d{4}-\d{2}-\d{2}) (.+)$/);
            if (match) {
                const [, hash, date, message] = match;
                if (/^(feat|feature|add|implement)/i.test(message)) {
                    features.push(`- ${message} (${hash}, ${date})`);
                } else if (/^(fix|bug|hotfix|patch|resolve)/i.test(message)) {
                    fixes.push(`- ${message} (${hash}, ${date})`);
                } else {
                    others.push(`- ${message} (${hash}, ${date})`);
                }
            }
        }
        let result = '';
        if (features.length) {
            result += '\n\n### Features\n' + features.join('\n') + '\n';
        }
        if (fixes.length) {
            result += '\n\n### Fixes\n' + fixes.join('\n') + '\n';
        }
        if (others.length) {
            result += '\n\n### Other\n' + others.join('\n') + '\n';
        }
        return result;
    }

    if (tags.length === 0) {
        // Nessun tag: mostra tutti i commit
        const log = execSync('git log --pretty=format:"%h %ad %s" --date=short', { encoding: 'utf8' });
        changelog += '\n\n## Unreleased (??/??/???)\n';
        changelog += categorizeCommits(log.split('\n'));
        return changelog;
    }
    // Prima release: dalla prima commit al primo tag
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        let range = '';
        if (i === tags.length - 1) {
            range = tag;
        } else {
            range = `${tags[i + 1]}..${tag}`;
        }
        // Recupera la data del tag
        let tagDate = '';
        try {
            tagDate = execSync(`git log -1 --format=%ad --date=short ${tag}`, { encoding: 'utf8' }).trim();
        } catch (e) {
            tagDate = '';
        }
        const log = execSync(`git log ${range} --pretty=format:"%h %ad %s" --date=short`, { encoding: 'utf8' });
        changelog += `\n\n## ${tag}${tagDate ? ` (${tagDate})` : ''}\n`;
        changelog += categorizeCommits(log.split('\n'));
    }
    // Commits dopo l'ultimo tag (Unreleased)
    const latestTag = tags[0];
    const logUnreleased = execSync(`git log ${latestTag}..HEAD --pretty=format:"%h %ad %s" --date=short`, { encoding: 'utf8' });
    if (logUnreleased.trim()) {
        changelog = '\n\n## Unreleased\n' + categorizeCommits(logUnreleased.split('\n')) + changelog;
    }
    return changelog;
}

function formatChangelog(log) {
    return '# CHANGELOG\n' + log;
}

function main() {
    const log = getGitLogByTag();
    const changelog = formatChangelog(log);
    writeFileSync('CHANGELOG.md', changelog);
    console.log('CHANGELOG.md generato!');
}

main();
