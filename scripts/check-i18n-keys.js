#!/usr/bin/env node
/**
 * Pre-commit hook: ko.json과 en.json의 키 구조가 동일한지 검증.
 * 키가 하나라도 불일치하면 exit 1로 커밋을 차단.
 */
const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
    return Object.entries(obj).flatMap(([k, v]) => {
        const full = prefix ? `${prefix}.${k}` : k;
        return typeof v === 'object' && v !== null && !Array.isArray(v)
            ? getKeys(v, full)
            : [full];
    }).sort();
}

const koPath = path.join(__dirname, '../apps/web/messages/ko.json');
const enPath = path.join(__dirname, '../apps/web/messages/en.json');

if (!fs.existsSync(koPath) || !fs.existsSync(enPath)) {
    console.log('Skipping i18n check: files not found');
    process.exit(0);
}

const ko = JSON.parse(fs.readFileSync(koPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const koKeys = getKeys(ko);
const enKeys = getKeys(en);

const missingInEn = koKeys.filter(k => !enKeys.includes(k));
const missingInKo = enKeys.filter(k => !koKeys.includes(k));

if (missingInEn.length > 0 || missingInKo.length > 0) {
    console.error('❌ i18n key mismatch detected!\n');
    if (missingInEn.length) console.error('Missing in en.json:', missingInEn.join(', '));
    if (missingInKo.length) console.error('Missing in ko.json:', missingInKo.join(', '));
    process.exit(1);
}

console.log('✅ i18n keys are in sync');
